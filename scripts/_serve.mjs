/**
 * 빌드 산출물을 실제로 서빙하고 관측하기 위한 공용 하네스.
 *
 * 이 저장소에는 자동 테스트가 없고, 실제로 겪은 사고 2건(빈 HTML·서버 로케일 무시)은
 * 단위 테스트가 원리적으로 잡을 수 없는 종류였다 — 결함이 *프로덕션 빌드가 만든 HTML*에서만
 * 드러나기 때문이다. 그래서 오라클을 산출물 대조에 둔다.
 */
import { spawn } from 'node:child_process';

/** 자기가 띄운 프로세스만 종료한다. `lsof | xargs kill`은 남의 프로세스를 죽일 수 있다. */
export async function serve({ port = 3939, env = {}, timeoutMs = 30_000 } = {}) {
  const child = spawn('pnpm', ['start'], {
    env: { ...process.env, PORT: String(port), ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));

  const base = `http://localhost:${port}`;
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (child.exitCode !== null) {
      throw new Error(`서버가 기동 전에 종료했습니다 (exit ${child.exitCode})\n${log}`);
    }
    try {
      const res = await fetch(base, { signal: AbortSignal.timeout(2000) });
      if (res.ok) break;
    } catch {
      /* 아직 안 떴다 */
    }
    if (Date.now() > deadline) {
      child.kill('SIGKILL');
      // 타임아웃은 성공이 아니라 실패다. 조용히 통과시키면 이후 전 체크가 무증상이 된다.
      throw new Error(`서버가 ${timeoutMs}ms 안에 기동하지 않았습니다.\n${log}`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  return {
    base,
    async stop() {
      child.kill('SIGTERM');
      await new Promise((r) => {
        const t = setTimeout(() => {
          child.kill('SIGKILL');
          r();
        }, 3000);
        child.on('exit', () => {
          clearTimeout(t);
          r();
        });
      });
    },
  };
}

/** 검증 대상 URL은 하드코딩하지 않고 sitemap(= app/sitemap.ts의 산출물)에서 열거한다. */
export async function urlsFromSitemap(base) {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) throw new Error('sitemap.xml에서 URL을 0개 파싱했습니다 — 하네스가 무증상으로 통과할 뻔했습니다.');
  return locs.map((u) => new URL(u).pathname);
}

export const stripTags = (html) =>
  html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const ldJsonBlocks = (html) =>
  [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) =>
    m[1].replace(/\\u003c/g, '<'),
  );

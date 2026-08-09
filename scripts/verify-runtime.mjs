#!/usr/bin/env node
/**
 * verify:runtime — 빌드 산출물을 실제로 서빙해 관측한다.
 *
 * prebuild 가드(arch-guard·i18n-guard)와 타입 계층이 못 잡는 것만 여기서 본다.
 * ko/en 파리티는 i18n-guard가 소유하므로 재구현하지 않는다 — 같은 오라클이 두 곳에 있으면
 * 드리프트하고, 드리프트한 오라클은 없는 오라클보다 해롭다.
 *
 * V1 본문 공백 · V2 로케일 · V3 키/자리표시자 누수 · V4 앵커 · V5 canonical/hreflang
 * V6 메타 라우트 · V7 404 · V8 축소 계약(키 0) · V9 검증 계약(더미 키)
 */
import { serve, urlsFromSitemap, stripTags, ldJsonBlocks } from './_serve.mjs';
import { readFileSync } from 'node:fs';

const PORT = Number(process.env.VERIFY_PORT ?? 3939);
const failures = [];
let assertions = 0;

const fail = (where, rule, cause, fix) => failures.push({ where, rule, cause, fix });
const check = () => (assertions += 1);

/** i18n 키가 문구 자리에 그대로 렌더된 흔적. t()는 키를 못 찾으면 키를 반환한다. */
const KEY_LEAK = /\b(?:site|nav|theme|lang|profile|about|career|projects|study|faq|contact|chat)\.[a-zA-Z][\w-]*(?:\.[\w-]+)+/g;
const PLACEHOLDER_LEAK = /\{(years|links|count|articles)\}/g;

// 화이트리스트를 두지 않는다. 실증된 오탐 없이 예외를 추가하면 규칙이 조용히 형해화된다.

function scanLeak(text) {
  const hits = new Set();
  for (const m of text.matchAll(KEY_LEAK)) {
    hits.add(m[0]);
  }
  for (const m of text.matchAll(PLACEHOLDER_LEAK)) hits.add(m[0]);
  return [...hits];
}

async function main() {
  const server = await serve({ port: PORT });
  const { base } = server;
  let paths;
  try {
    const contentPaths = await urlsFromSitemap(base);

    // ── 커버리지 하한 계약 ───────────────────────────────────────────────────
    // 하네스는 자기가 무엇을 *검사하지 않았는지* 모른다. sitemap이 조용히 줄면
    // "6 URL · 49 단정 전부 통과"처럼 green인 채로 검사 범위가 반토막 난다.
    // 그래서 검사 대상 집합의 크기 자체를 오라클에 넣는다.
    // 기대치는 하드코딩이 아니라 데이터에서 계산한다 — 회사를 추가하면 자동으로 넓어진다.
    const careerSrc = readFileSync('src/helpers/datas/career.ts', 'utf8');
    const slugCount = [...careerSrc.matchAll(/^\s*slug: '([^']+)'/gm)].length;
    const expected = (1 + slugCount) * 2; // (홈 + 회사 수) × 로케일 2
    check();
    if (slugCount === 0) {
      fail('src/helpers/datas/career.ts', 'V0/coverage-blind', 'career.ts에서 slug를 하나도 읽지 못했습니다.', 'slug 리터럴 패턴이 바뀌었는지 확인하세요 — 기대치가 0이면 이 검사가 무력해집니다.');
    } else if (contentPaths.length !== expected) {
      fail('/sitemap.xml', 'V0/coverage-shrink', `sitemap URL이 ${contentPaths.length}개인데 데이터 기준 기대치는 ${expected}개입니다((홈 1 + 회사 ${slugCount}) × 로케일 2).`, '로케일이나 페이지가 사이트맵에서 빠지면 hreflang이 무너지고, 이 하네스의 검사 범위도 함께 줄어듭니다.');
    }
    // sitemap에 없지만 검증해야 하는 페이지. /contact는 noindex 폼이라 sitemap에서 제외돼 있고,
    // 본문이 얇은 것이 정상이므로 콘텐츠 분량·canonical 검사에서는 뺀다(폼도 프리렌더는 돼야 한다).
    const FORM_PAGES = new Set(['/contact']);
    paths = [...contentPaths, ...FORM_PAGES];

    for (const p of paths) {
      const isContent = !FORM_PAGES.has(p);
      const res = await fetch(base + p);
      const html = await res.text();
      const text = stripTags(html);

      // ── V1 본문 공백 ────────────────────────────────────────────────────
      check();
      if (html.includes('BAILOUT_TO_CLIENT_SIDE_RENDERING')) {
        fail(p, 'V1/empty-body', 'HTML에 BAILOUT_TO_CLIENT_SIDE_RENDERING이 있습니다 — 정적 페이지 본문이 통째로 비었습니다.', '상단 프로바이더에서 useSearchParams를 쓰지 않았는지 확인하세요(arch-guard R9).');
      } else if (!/<h1[\s>]/.test(html)) {
        fail(p, 'V1/no-h1', '<h1>이 없습니다.', '페이지 본문이 실제로 렌더됐는지 확인하세요.');
      } else if (text.length < (isContent ? 300 : 40)) {
        fail(p, 'V1/thin-body', `본문 텍스트가 ${text.length}자뿐입니다.`, '본문이 클라이언트 렌더로 빠지지 않았는지 확인하세요 — 크롤러는 이 HTML만 봅니다.');
      }

      // ── V2 로케일 ───────────────────────────────────────────────────────
      check();
      const lang = html.match(/<html[^>]+lang="([^"]+)"/)?.[1];
      const wantEn = p === '/en' || p.startsWith('/en/');
      if (!lang) {
        fail(p, 'V2/no-lang', '<html lang> 속성이 없습니다 — 루트 레이아웃이 적용되지 않았습니다.', 'route group 밖에 만들어진 라우트가 아닌지 확인하세요(arch-guard R3).');
      } else if (wantEn !== lang.startsWith('en')) {
        fail(p, 'V2/lang-mismatch', `URL은 ${wantEn ? '영어' : '한국어'}인데 lang="${lang}"입니다.`, '라우트가 로케일을 올바로 주입하는지 확인하세요.');
      }

      // ── V3 키·자리표시자 누수 (본문 + JSON-LD 각각) ─────────────────────
      check();
      const bodyLeaks = scanLeak(text);
      if (bodyLeaks.length) {
        fail(p, 'V3/key-leak', `본문에 i18n 키/자리표시자가 그대로 렌더됐습니다: ${bodyLeaks.join(', ')}`, 't()는 키를 못 찾으면 키를 그대로 반환합니다. 해당 키가 두 JSON에 있는지 확인하세요.');
      }
      check();
      for (const block of ldJsonBlocks(html)) {
        const ldLeaks = scanLeak(block);
        if (ldLeaks.length) {
          fail(p, 'V3/key-leak-ldjson', `JSON-LD에 i18n 키가 누수됐습니다: ${ldLeaks.join(', ')}`, '구조화 데이터와 본문이 어긋나면 검색엔진이 불일치로 판단합니다.');
        }
        try {
          JSON.parse(block);
        } catch (e) {
          fail(p, 'V3/ldjson-invalid', `JSON-LD가 파싱되지 않습니다: ${e.message}`, 'JsonLd의 이스케이프 처리를 확인하세요.');
        }
      }

      // ── V4 앵커 ─────────────────────────────────────────────────────────
      check();
      const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
      const dangling = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))].filter(
        (a) => a && !ids.has(a),
      );
      if (dangling.length) {
        fail(p, 'V4/dangling-anchor', `가리키는 대상이 없는 앵커: ${dangling.join(', ')}`, '해당 id를 가진 요소가 렌더되는지 확인하세요.');
      }

      // ── V5 canonical / hreflang ─────────────────────────────────────────
      check();
      if (isContent) {
        const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];
        if (!canonical) {
          fail(p, 'V5/no-canonical', 'canonical 링크가 없습니다.', 'alternatesFor(locale, path)가 메타데이터에 반영되는지 확인하세요.');
        } else if (new URL(canonical).pathname !== p) {
          fail(p, 'V5/canonical-mismatch', `canonical이 자기 자신을 가리키지 않습니다 — ${new URL(canonical).pathname}`, 'canonical은 자기 URL이어야 합니다.');
        }
        // Next는 hrefLang(camelCase)로 내보낸다. HTML 속성은 대소문자 무관이므로 gi로 읽는다.
        const hreflangs = new Set(
          [...html.matchAll(/<link[^>]+rel="alternate"[^>]+hreflang="([^"]+)"/gi)].map((m) => m[1]),
        );
        for (const want of ['ko-KR', 'en-US', 'x-default']) {
          if (!hreflangs.has(want)) {
            fail(p, 'V5/no-hreflang', `hreflang="${want}"가 없습니다.`, '두 언어 버전이 서로를 가리켜야 언어 신호가 성립합니다.');
          }
        }
      }
    }

    // ── V2 보강: ko/en의 h1이 실제로 다른가 (영어 페이지의 한국어 폴백 탐지) ──
    for (const koPath of contentPaths.filter((p) => !p.startsWith("/en"))) {
      const enPath = koPath === '/' ? '/en' : `/en${koPath}`;
      check();
      if (!paths.includes(enPath)) {
        // 조용히 건너뛰지 않는다 — 짝이 없다는 것 자체가 결함이다.
        fail(enPath, 'V2/missing-locale-pair', `'${koPath}'에 대응하는 영어 페이지가 검사 목록에 없습니다.`, '한국어에 페이지를 추가하면 영어에도 추가해야 hreflang이 짝을 이룹니다.');
        continue;
      }
      const h1 = async (p) =>
        stripTags((await (await fetch(base + p)).text()).match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '');
      const [a, b] = [await h1(koPath), await h1(enPath)];
      if (a && a === b) {
        fail(enPath, 'V2/locale-parity', `'${koPath}'와 '${enPath}'의 <h1>이 동일합니다 — 영어 페이지가 한국어로 폴백했습니다.`, 'en.json에 해당 키를 추가하세요. 화면은 비지 않으므로 이 검사 외에는 아무도 알려주지 않습니다.');
      }
    }

    // ── V6 메타 라우트 ────────────────────────────────────────────────────
    check();
    const robots = await (await fetch(`${base}/robots.txt`)).text();
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
      if (!robots.includes(bot)) {
        fail('/robots.txt', 'V6/bot-missing', `${bot}가 robots.txt에 없습니다.`, '인용되려면 먼저 크롤링이 허용돼야 합니다(GEO).');
      }
    }
    for (const meta of ['/manifest.webmanifest', '/llms.txt', '/opengraph-image']) {
      check();
      const r = await fetch(base + meta);
      if (!r.ok) fail(meta, 'V6/meta-route', `${r.status}를 반환합니다.`, '메타 라우트가 정상 생성되는지 확인하세요.');
    }
    check();
    const llms = await (await fetch(`${base}/llms.txt`)).text();
    const llmsLeaks = scanLeak(llms);
    if (llmsLeaks.length) fail('/llms.txt', 'V6/key-leak', `키 누수: ${llmsLeaks.join(', ')}`, 'llms.txt는 AI 에이전트가 읽는 평문입니다.');

    // ── V7 404 ────────────────────────────────────────────────────────────
    check();
    const notFound = await fetch(`${base}/career/__does-not-exist__`);
    if (notFound.status !== 404) {
      fail('/career/__does-not-exist__', 'V7/no-404', `404가 아니라 ${notFound.status}입니다.`, '오라클 sanity 체크 — 존재하지 않는 경로는 404여야 합니다.');
    }

    // ── V8 축소 계약 (자격증명 0) ─────────────────────────────────────────
    check();
    const chatGet = await fetch(`${base}/api/chat`);
    const chatBody = await chatGet.json().catch(() => ({}));
    if (chatBody.available !== false) {
      fail('/api/chat', 'V8/degrade-chat', `GET이 {"available":false}를 반환하지 않았습니다: ${JSON.stringify(chatBody)}`, 'GROQ_API_KEY 없이도 챗 탭이 우아하게 비활성화돼야 합니다(ADR 0005).');
    }

    // 레이트리밋이 프로세스 전역이라 IP를 변주하지 않으면 4번째 요청이 429가 되어 가짜 실패가 난다.
    const contactCases = [
      { body: { email: 'a@b.com', message: '0123456789' }, want: 400, label: '이름 없음' },
      { body: { name: 'A', email: 'bad', message: '0123456789' }, want: 400, label: '이메일 형식' },
      { body: { name: 'A', email: 'a@b.com', message: 'short' }, want: 400, label: '메시지 10자 미만' },
      { body: { name: 'A', email: 'a@b.com', message: '0123456789' }, want: 503, label: 'SMTP 미설정' },
    ];
    for (const [i, c] of contactCases.entries()) {
      check();
      const r = await fetch(`${base}/api/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${i + 1}` },
        body: JSON.stringify(c.body),
      });
      if (r.status !== c.want) {
        fail('/api/contact', 'V8/degrade-contact', `'${c.label}' 케이스가 ${c.want}가 아니라 ${r.status}입니다.`, '검증(400) → 레이트리밋(429) → 자격증명(503) 순서가 유지되는지 확인하세요.');
      } else if (c.want === 503) {
        const b = await r.json().catch(() => ({}));
        if (b.fallback !== true) fail('/api/contact', 'V8/degrade-contact', '503 응답에 fallback:true가 없습니다.', '클라이언트가 대체 안내를 띄울 근거입니다.');
      }
    }
  } finally {
    await server.stop();
  }

  // ── V9 검증 계약 (더미 키로 재기동) ──────────────────────────────────────
  // isChatConfigured() 체크가 body 파싱보다 앞이라, 키가 없으면 입력 검증 분기에 도달할 수 없다.
  const server2 = await serve({ port: PORT + 1, env: { GROQ_API_KEY: 'verify-fake-key' } });
  try {
    const cases = [
      { body: { message: '' }, want: 400, label: '빈 메시지' },
      { body: { message: 'hi', history: Array.from({ length: 21 }, () => ({ role: 'user', content: 'x' })) }, want: 400, label: '히스토리 초과' },
    ];
    for (const [i, c] of cases.entries()) {
      check();
      const r = await fetch(`${server2.base}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.1.0.${i + 1}` },
        body: JSON.stringify(c.body),
      });
      if (r.status !== c.want) {
        fail('/api/chat', 'V9/validation', `'${c.label}' 케이스가 ${c.want}가 아니라 ${r.status}입니다.`, '네트워크 호출 전 입력 검증이 동작하는지 확인하세요.');
      }
    }
  } finally {
    await server2.stop();
  }

  // ── 결과 ────────────────────────────────────────────────────────────────
  // 0 단정으로 성공 종료하는 것이 이 하네스의 최대 실패 모드다.
  if (assertions === 0) {
    console.error('✖ verify:runtime — 단정을 0건 수행했습니다. 하네스가 무증상으로 통과했습니다.');
    process.exit(1);
  }
  if (failures.length === 0) {
    console.log(`✔ verify:runtime — ${paths.length} URL · ${assertions} 단정 전부 통과`);
    process.exit(0);
  }
  console.error(`\n✖ verify:runtime — ${failures.length}건 실패 (${paths.length} URL · ${assertions} 단정 중)\n`);
  for (const f of failures) {
    console.error(`${f.where}  [${f.rule}]`);
    console.error(`  원인  ${f.cause}`);
    console.error(`  수정  ${f.fix}\n`);
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(`✖ verify:runtime — 하네스 오류: ${e.message}`);
  process.exit(1);
});

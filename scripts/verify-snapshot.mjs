#!/usr/bin/env node
/**
 * verify:snapshot — 리팩터의 등가성 센서.
 *
 * 타입만 바꾸는 리팩터(i18n 키 유니온화 등)는 산출물이 바뀌지 않는 것이 정상이다.
 * 그 실패 모드는 "키를 잘못 바꿔 *다른 유효한 문자열*이 렌더된다"인데, 둘 다 유효한 키이므로
 * 타입은 이것을 잡지 못한다. 본문 텍스트 diff가 정확히 그 실패 모드의 센서다.
 *
 *   pnpm verify:snapshot --write   # 착수 전 기준선
 *   pnpm verify:snapshot           # 각 단계 후 — diff 0이 등가성의 증거
 *
 * 한계(정직히): 관측 가능한 *산출물*의 등가성만 증명한다. 클라이언트 상호작용
 * (탭 키보드 이동·테마/언어 토글·popstate)과 챗 응답 경로는 스냅샷 밖이므로 UNVERIFIED다.
 */
import { serve, urlsFromSitemap, stripTags, ldJsonBlocks } from './_serve.mjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), '.claude/ai-readability/seungah-portfolio/snapshot.json');
const WRITE = process.argv.includes('--write');
const PORT = Number(process.env.VERIFY_PORT ?? 3941);

/**
 * 시각 의존값 정규화 — 하지 않으면 스냅샷이 매달 저절로 깨져 아무도 신뢰하지 않게 된다.
 * career.ts의 dayjs().format('YYYY.MM') · profile.ts의 재직 개월 누적 · sitemap의 lastModified.
 */
function normalize(s) {
  return s
    .replace(/\d{4}\.\d{2}/g, '<YM>')
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, '<TS>')
    .replace(/"\d{4}-\d{2}-\d{2}"/g, '"<DATE>"')
    .replace(/\d+년\s*차/g, '<YEARS>년차')
    .replace(/\b\d+\+?\s*years?\b/gi, '<YEARS> years');
}

const sortKeys = (v) =>
  Array.isArray(v)
    ? v.map(sortKeys)
    : v && typeof v === 'object'
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]))
      : v;

async function capture() {
  const server = await serve({ port: PORT });
  const snap = {};
  try {
    const paths = [...(await urlsFromSitemap(server.base)), '/contact'];
    for (const p of paths) {
      const html = await (await fetch(server.base + p)).text();
      snap[`page:${p}`] = {
        text: normalize(stripTags(html)),
        head: normalize(
          [...html.matchAll(/<(?:link|meta)\b[^>]*>/g)]
            .map((m) => m[0])
            .filter((t) => /canonical|alternate|og:|twitter:|description/.test(t))
            .sort()
            .join('\n'),
        ),
        ldjson: ldJsonBlocks(html)
          .map((b) => {
            try {
              return normalize(JSON.stringify(sortKeys(JSON.parse(b))));
            } catch {
              return `UNPARSEABLE:${normalize(b)}`;
            }
          })
          .sort(),
      };
    }
    for (const meta of ['/llms.txt', '/sitemap.xml', '/robots.txt', '/manifest.webmanifest']) {
      snap[`meta:${meta}`] = normalize(await (await fetch(server.base + meta)).text());
    }
  } finally {
    await server.stop();
  }
  if (Object.keys(snap).length === 0) throw new Error('스냅샷이 비었습니다 — 무증상 통과를 막습니다.');
  return snap;
}

function diff(before, after) {
  const out = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of [...keys].sort()) {
    const a = JSON.stringify(before[k] ?? null);
    const b = JSON.stringify(after[k] ?? null);
    if (a === b) continue;
    if (!(k in before)) out.push({ k, kind: '추가됨' });
    else if (!(k in after)) out.push({ k, kind: '사라짐' });
    else {
      // 어느 필드가 달라졌는지 좁혀준다
      const fields =
        typeof before[k] === 'object' && before[k]
          ? Object.keys(before[k]).filter(
              (f) => JSON.stringify(before[k][f]) !== JSON.stringify(after[k][f]),
            )
          : ['(전체)'];
      const sample = (() => {
        const f = fields[0];
        const x = String(f === '(전체)' ? before[k] : before[k][f]);
        const y = String(f === '(전체)' ? after[k] : after[k][f]);
        for (let i = 0; i < Math.max(x.length, y.length); i += 1) {
          if (x[i] !== y[i]) {
            const s = Math.max(0, i - 60);
            return `…${x.slice(s, i + 60)}\n      →  …${y.slice(s, i + 60)}`;
          }
        }
        return '(길이만 다름)';
      })();
      out.push({ k, kind: `변경: ${fields.join(', ')}`, sample });
    }
  }
  return out;
}

const snap = await capture();

if (WRITE) {
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(snap, null, 2));
  console.log(`✔ verify:snapshot — 기준선 기록 (${Object.keys(snap).length} 항목) → ${path.relative(process.cwd(), OUT)}`);
  process.exit(0);
}

if (!existsSync(OUT)) {
  console.error('✖ verify:snapshot — 기준선이 없습니다. 리팩터 착수 *전에* `pnpm verify:snapshot --write`를 먼저 실행하세요.');
  process.exit(1);
}

const d = diff(JSON.parse(readFileSync(OUT, 'utf8')), snap);
if (d.length === 0) {
  console.log(`✔ verify:snapshot — 기준선과 동일 (${Object.keys(snap).length} 항목). 산출물 등가성 확인.`);
  process.exit(0);
}

console.error(`\n✖ verify:snapshot — 기준선과 ${d.length}개 항목이 다릅니다 (${Object.keys(snap).length} 항목 중)\n`);
for (const item of d) {
  console.error(`${item.k}  [${item.kind}]`);
  if (item.sample) console.error(`  기준선  …${item.sample}\n`);
}
console.error('의도한 변경이면 `pnpm verify:snapshot --write`로 기준선을 갱신하세요.');
console.error('의도하지 않았다면 되돌리세요 — 타입 검사가 통과해도 다른 유효한 키로 바뀌었을 수 있습니다.\n');
process.exit(1);

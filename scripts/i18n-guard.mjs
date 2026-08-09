#!/usr/bin/env node
/**
 * i18n-guard — 조용히 어긋나는 콘텐츠 손상을 빌드 실패로 승격시킨다.
 *
 * 이 저장소에서 가장 자주·가장 조용히 깨지는 클래스가 i18n이다. t()는 키를 못 찾으면
 * 키 문자열을 그대로 반환하므로 예외 없이 배포 HTML에 박히고, ko/en 배열 길이가 어긋나면
 * 인덱스로 짝지어진 항목이 통째로 밀린다. 둘 다 lint·typecheck·build를 모두 통과한다(실측).
 *
 * R6  ko/en 파리티 — 키 구조 + 배열 길이
 * R7  데이터 계약  — helpers/datas의 id마다 대응 i18n 키 존재
 * R12 하드코딩 금지 — 데이터 계층에 표시 문구(한국어)를 직접 적지 않는다
 *
 * R7이 타입(R4/R8)과 겹치지 않고 상보적인 이유: 타입은 `${slug}.items.${itemId}` 같은
 * 2단 교차곱 동적 키를 검사할 수 없다(TS가 실존하지 않는 조합까지 전개한다).
 * 여기서는 실제 데이터 id를 실제 JSON과 대조하므로 교차곱 문제 자체가 없다.
 *
 * 의존성 0 — Node 내장만 사용.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const I18N = path.join(ROOT, 'src/lib/i18n');
const DATA = path.join(ROOT, 'src/helpers/datas');

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const readSrc = (f) => readFileSync(path.join(DATA, f), 'utf8');

const violations = [];
const push = (loc, rule, cause, fix) => violations.push({ loc, rule, cause, fix });

const ko = readJson(path.join(I18N, 'ko.json'));
const en = readJson(path.join(I18N, 'en.json'));

// ── R6: 파리티 ───────────────────────────────────────────────────────────────
let parityChecks = 0;

function parity(a, b, keyPath = '') {
  parityChecks += 1;
  const here = keyPath || '(root)';

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      push(
        `src/lib/i18n/en.json  ${here}`,
        'i18n/type-mismatch',
        `'${here}'의 타입이 다릅니다 — ko ${Array.isArray(a) ? 'array' : typeof a} / en ${Array.isArray(b) ? 'array' : typeof b}.`,
        `en.json의 '${here}'를 ko.json과 같은 형태로 맞추세요.`,
      );
      return;
    }
    if (a.length !== b.length) {
      push(
        `src/lib/i18n/en.json  ${here}`,
        'i18n/array-length-mismatch',
        `'${here}' 배열 길이가 다릅니다 — ko ${a.length} / en ${b.length}.`,
        `배열은 인덱스로 짝지어지므로 길이가 다르면 조용히 어긋납니다.\n        en.json의 '${here}'를 ${a.length}개로 맞추세요.`,
      );
      return;
    }
    a.forEach((v, i) => parity(v, b[i], `${here}[${i}]`));
    return;
  }

  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') {
      push(
        `src/lib/i18n/en.json  ${here}`,
        'i18n/type-mismatch',
        `'${here}'가 en.json에서 객체가 아닙니다.`,
        `ko.json과 같은 구조로 맞추세요.`,
      );
      return;
    }
    for (const k of Object.keys(a)) {
      const child = keyPath ? `${keyPath}.${k}` : k;
      if (!(k in b)) {
        push(
          `src/lib/i18n/en.json  ${child}`,
          'i18n/missing-key',
          `en.json에 '${child}' 키가 없습니다 (ko.json에는 있음).`,
          `en.json의 같은 위치에 '${k}'를 추가하세요.\n        없으면 한국어로 폴백해 영어 페이지에 한국어가 섞입니다.`,
        );
        continue;
      }
      parity(a[k], b[k], child);
    }
    for (const k of Object.keys(b)) {
      if (!(k in a)) {
        const child = keyPath ? `${keyPath}.${k}` : k;
        push(
          `src/lib/i18n/ko.json  ${child}`,
          'i18n/extra-key',
          `en.json에만 있는 키 '${child}'입니다 (ko.json에 없음).`,
          `ko.json에 추가하거나 en.json에서 제거하세요 — 두 파일은 구조가 완전히 같아야 합니다.`,
        );
      }
    }
  }
}

parity(ko, en);

// ── R7: 데이터 계약 ──────────────────────────────────────────────────────────
let contractChecks = 0;

/** 데이터 파일에서 리터럴 id를 뽑는다. 현재 모든 id가 리터럴임을 전제한다(계산식이면 놓친다). */
function literals(src, re) {
  return [...src.matchAll(re)].map((m) => m[1]);
}

function requireKey(keyPath, why) {
  contractChecks += 1;
  for (const [locale, json] of [['ko', ko], ['en', en]]) {
    let cur = json;
    for (const seg of keyPath.split('.')) {
      if (cur && typeof cur === 'object' && seg in cur) cur = cur[seg];
      else {
        push(
          `src/lib/i18n/${locale}.json  ${keyPath}`,
          'i18n/data-contract',
          `${why}\n        ${locale}.json에 '${keyPath}' 키가 없습니다.`,
          `${locale}.json에 '${keyPath}'를 추가하세요. t()는 키를 못 찾으면 키 문자열을 그대로 렌더합니다.`,
        );
        return;
      }
    }
  }
}

// career — 회사와 항목
const careerSrc = readSrc('career.ts');
const slugs = literals(careerSrc, /^\s*slug: '([^']+)'/gm);
if (slugs.length === 0) {
  push('src/helpers/datas/career.ts', 'i18n/guard-blind', '데이터 id를 하나도 추출하지 못했습니다.', 'slug 리터럴 패턴이 바뀌었는지 확인하세요 — 0건 통과는 무증상 실패입니다.');
}
for (const slug of slugs) {
  for (const field of ['title', 'logoAlt', 'role', 'description', 'summary']) {
    requireKey(`career.companies.${slug}.${field}`, `career.ts의 회사 '${slug}'에 대한 문구가 필요합니다.`);
  }
}
// career 항목 id — 각 회사 블록 안에서만 찾아 회사에 귀속시킨다
const blocks = careerSrc.split(/^\s*slug: '/m).slice(1);
blocks.forEach((block, i) => {
  const slug = slugs[i];
  for (const id of literals(block, /^\s*id: '([^']+)'/gm)) {
    requireKey(`career.companies.${slug}.items.${id}.title`, `career.ts의 '${slug}' 항목 '${id}'에 대한 제목이 필요합니다.`);
  }
});

// faq
const faqSrc = readSrc('faq.ts');
const faqBlock = faqSrc.match(/faqIds\s*=\s*\[([\s\S]*?)\]/);
for (const id of faqBlock ? literals(faqBlock[1], /'([^']+)'/g) : []) {
  requireKey(`faq.items.${id}.question`, `faq.ts의 '${id}'에 대한 질문이 필요합니다.`);
  requireKey(`faq.items.${id}.answer`, `faq.ts의 '${id}'에 대한 답변이 필요합니다.`);
}

// studies — 그룹과 링크
const studySrc = readSrc('studies.ts');
for (const groupBlock of studySrc.split(/^\s*\{\s*$/m)) {
  const gid = groupBlock.match(/^\s*id: '([^']+)',\s*$\n\s*links:/m)?.[1];
  if (!gid) continue;
  requireKey(`study.groups.${gid}.label`, `studies.ts의 그룹 '${gid}'에 대한 라벨이 필요합니다.`);
  for (const lid of literals(groupBlock, /\{\s*id: '([^']+)', blogSlug:/g)) {
    requireKey(`study.groups.${gid}.links.${lid}`, `studies.ts의 '${gid}' 링크 '${lid}'에 대한 제목이 필요합니다.`);
  }
}

// ── R12: 데이터 계층의 표시 문구 하드코딩 금지 ───────────────────────────────
// Phase 0의 위반 probe E는 두 부분이었다 — 데이터 모듈이 UI를 import하는 것(arch-guard R1이 막는다)과
// 데이터 모듈에 한국어 문구를 직접 적는 것(여기서 막는다). 후자를 두면 영어 페이지가 반쪽이 되는데,
// 화면은 비지 않으므로 아무도 알려주지 않는다.
// 주석과 한국어가 아닌 값(기술명·URL·id)은 대상이 아니다.
let hardcodeChecks = 0;
const HANGUL = /[가-힣]/;

for (const file of ['career.ts', 'profile.ts', 'projects.ts', 'studies.ts', 'faq.ts']) {
  const src = readSrc(file);
  src.split('\n').forEach((line, i) => {
    hardcodeChecks += 1;
    const code = line.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '');
    if (/^\s*\*/.test(line)) return; // 블록 주석 본문
    for (const m of code.matchAll(/(['"`])((?:(?!\1)[^\\]|\\.)*)\1/g)) {
      if (!HANGUL.test(m[2])) continue;
      push(
        `src/helpers/datas/${file}:${i + 1}`,
        'i18n/hardcoded-copy',
        `데이터 파일에 한국어 문자열이 있습니다: "${m[2].slice(0, 40)}"\n        이 계층은 언어중립이어야 합니다 — 문구를 여기 적으면 영어 페이지가 반쪽이 됩니다.`,
        `문구를 src/lib/i18n/{ko,en}.json으로 옮기고 여기에는 키(id)만 두세요.\n        화면은 비지 않으므로 이 검사 외에는 아무도 알려주지 않습니다.`,
      );
    }
  });
}

// ── 출력 ─────────────────────────────────────────────────────────────────────
if (parityChecks === 0 || contractChecks === 0 || hardcodeChecks === 0) {
  console.error('✖ i18n-guard: 검사 건수가 0입니다 — 무증상 통과를 막기 위해 실패로 처리합니다.');
  process.exit(1);
}

if (violations.length === 0) {
  console.log(
    `✔ i18n-guard: 위반 없음 (파리티 ${parityChecks} 노드 · 계약 ${contractChecks} 키 · 하드코딩 ${hardcodeChecks} 줄)`,
  );
  process.exit(0);
}

console.error(
  `\n✖ i18n-guard — 위반 ${violations.length}건 (파리티 ${parityChecks} 노드 · 계약 ${contractChecks} 키 · 하드코딩 ${hardcodeChecks} 줄 검사)\n`,
);
for (const v of violations) {
  console.error(`${v.loc}  [${v.rule}]`);
  console.error(`  원인  ${v.cause}`);
  console.error(`  수정  ${v.fix}\n`);
}
process.exit(1);

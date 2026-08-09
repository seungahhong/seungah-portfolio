#!/usr/bin/env node
/**
 * doctor — "무엇이 없어서 안 되는지"를 기계 판독 가능하게 만든다.
 *
 * 이 앱은 자격증명이 없으면 죽는 대신 축소된다(env 게이트가 곧 Port/Adapter다).
 * 문제는 그 계약이 코드 안에만 있어서, 처음 온 사람이나 에이전트는 "왜 챗이 안 뜨지"를
 * 소스를 읽어야만 알 수 있다는 것이었다. 여기서 그것을 출력으로 만든다.
 *
 * 종료 코드 규약이 핵심:
 *   DEGRADED(축소)  → exit 0   기능만 줄었을 뿐 정상이다
 *   BLOCKED(막힘)   → exit 1   런타임/패키지매니저 버전 불일치처럼 진짜로 못 도는 것
 * 이 구분이 없으면 에이전트가 축소를 고장으로 오인해 불필요한 수정을 시도한다.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const JSON_OUT = process.argv.includes('--json');
const rows = [];
let blocked = 0;

const add = (kind, name, detail, status) => {
  rows.push({ kind, name, detail, status });
  if (status === 'BLOCKED') blocked += 1;
};

// ── 런타임 ───────────────────────────────────────────────────────────────────
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const nvmrc = existsSync(path.join(ROOT, '.nvmrc'))
  ? readFileSync(path.join(ROOT, '.nvmrc'), 'utf8').trim()
  : null;

const nodeVer = process.versions.node;
if (nvmrc && nvmrc !== nodeVer) {
  add('runtime', 'node', `${nodeVer} — .nvmrc는 ${nvmrc}`, 'WARN');
} else {
  add('runtime', 'node', `${nodeVer}${nvmrc ? ` (.nvmrc ${nvmrc})` : ''}`, 'OK');
}

const wantPnpm = pkg.packageManager?.replace('pnpm@', '');
const gotPnpm = process.env.npm_config_user_agent?.match(/pnpm\/([\d.]+)/)?.[1];
if (wantPnpm && gotPnpm && wantPnpm !== gotPnpm) {
  add('pkgmgr', 'pnpm', `${gotPnpm} — packageManager는 ${wantPnpm}`, 'BLOCKED');
} else {
  add('pkgmgr', 'pnpm', gotPnpm ? `${gotPnpm} (packageManager ${wantPnpm})` : `packageManager ${wantPnpm}`, 'OK');
}

// ── 환경변수 계약 ────────────────────────────────────────────────────────────
// 미설정이 정상 상태다. 무엇이 축소되는지만 알려준다.
const ENV_CONTRACT = [
  { keys: ['GROQ_API_KEY'], degraded: '챗 비활성 (GET /api/chat → {"available":false})' },
  { keys: ['GMAIL_USER', 'GMAIL_PASS'], degraded: '/api/contact → 503 + fallback:true (검증·레이트리밋은 정상)' },
  { keys: ['NEXT_PUBLIC_SITE_URL'], degraded: 'canonical 기준을 기본 도메인으로 사용' },
  { keys: ['NEXT_PUBLIC_GA_ID'], degraded: 'GA4 스크립트 미주입' },
  { keys: ['NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION'], degraded: 'Google 소유권 메타 미렌더' },
  { keys: ['NEXT_PUBLIC_NAVER_SITE_VERIFICATION'], degraded: 'Naver 소유권 메타 미렌더' },
];

const flags = [];
for (const c of ENV_CONTRACT) {
  const set = c.keys.filter((k) => (process.env[k] ?? '').trim().length > 0);
  const label = c.keys.join('/');
  if (set.length === c.keys.length) {
    add('env', label, '설정됨', 'OK');
  } else if (set.length === 0) {
    add('env', label, `미설정 → ${c.degraded}`, 'DEGRADED');
    flags.push(c.keys[0]);
  } else {
    // 일부만 설정 — 미설정과 동일하게 취급되므로 오히려 헷갈린다. 명시적으로 경고한다.
    add('env', label, `일부만 설정(${set.join(', ')}) → 미설정과 동일하게 동작합니다`, 'WARN');
  }
}

// ── 판정 ─────────────────────────────────────────────────────────────────────
const verdict = [
  blocked ? 'BLOCKED' : 'BUILD_OK',
  blocked ? null : 'VERIFY_OK',
  flags.includes('GROQ_API_KEY') ? 'CHAT_DISABLED' : 'CHAT_ENABLED',
  flags.includes('GMAIL_USER') ? 'MAIL_DISABLED' : 'MAIL_ENABLED',
].filter(Boolean);

if (JSON_OUT) {
  console.log(JSON.stringify({ verdict, rows, blocked, next: blocked ? null : 'pnpm verify' }, null, 2));
  process.exit(blocked ? 1 : 0);
}

const pad = (s, n) => String(s).padEnd(n);
for (const r of rows) {
  console.log(`${pad(r.kind, 10)} ${pad(r.name, 38)} ${pad(r.detail, 62)} ${r.status}`);
}
console.log(`${pad('verdict', 10)} ${verdict.join(' · ')}`);
console.log(
  `${pad('next', 10)} ${blocked ? '위 BLOCKED 항목을 먼저 해결하세요.' : 'pnpm verify        (자격증명 없이 전부 통과해야 합니다)'}`,
);
process.exit(blocked ? 1 : 0);

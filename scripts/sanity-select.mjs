/**
 * sanity — 변경-스코프 선택 레인.
 *
 * sanity는 **태그가 아니라 선택**이다. 코드에 `@sanity`를 심지 않고,
 * 호출 시점에 "이번 변경이 건드린 것"만 리스트로 물질화한다.
 *
 * 3단계이며 **각 단계는 실패 시 넓히는 방향으로만 폴백**한다(under-selection 회피).
 *   1. 변경 파일        — git diff
 *   2. 역참조 확장      — `vitest related` 서브커맨드 (러너 네이티브 임포트 그래프)
 *   3. 관련 페이지 E2E  — 경로/임포트 미러 → 실패 시 @e2e-mock 전량
 *
 * ⚠️ 차단성(unit/integration = blocking, mock E2E = non-blocking)은 **표준이 아니라 운영 결정**이다.
 * ⚠️ `@e2e-live`는 sanity 대상이 아니다 — 수동 on-demand 전용.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const mode = process.argv[2];
if (!['--vitest', '--e2e'].includes(mode)) {
  console.error('사용법: node scripts/sanity-select.mjs --vitest | --e2e');
  process.exit(2);
}

const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim();

/** base 브랜치를 결정한다. 추측하지 않는다 — 잘못된 base는 조용한 under-selection이 된다. */
function resolveBase() {
  if (process.env.GITHUB_BASE_REF) return `origin/${process.env.GITHUB_BASE_REF}`;
  try {
    return sh('git', ['symbolic-ref', 'refs/remotes/origin/HEAD']).replace('refs/remotes/', '');
  } catch {
    return null;
  }
}

/** 1단계 — 변경 파일 */
function changedFiles() {
  const base = resolveBase();
  let out = '';
  if (base) {
    try {
      out = sh('git', ['diff', '--name-only', `${base}...HEAD`]);
    } catch {
      console.error(`[sanity] base '${base}'로 diff에 실패했습니다. 워킹트리 diff로 넓힙니다.`);
    }
  } else {
    console.error('[sanity] base 브랜치를 감지하지 못했습니다. 추측하지 않고 워킹트리 diff로 넓힙니다.');
  }
  const working = sh('git', ['diff', '--name-only']);
  const staged = sh('git', ['diff', '--name-only', '--cached']);
  const all = [...out.split('\n'), ...working.split('\n'), ...staged.split('\n')]
    .map((f) => f.trim())
    .filter((f) => f && /\.(ts|tsx)$/.test(f) && f.startsWith('src/'));
  return [...new Set(all)];
}

const files = changedFiles();
console.log(`[sanity] base = ${resolveBase() ?? '(감지 실패 — 워킹트리)'}`);
console.log(`[sanity] 변경된 src 파일 ${files.length}건${files.length ? ':' : ''}`);
files.forEach((f) => console.log(`         · ${f}`));

if (mode === '--vitest') {
  if (files.length === 0) {
    console.log('[sanity] 변경 없음 — unit/integration 전량으로 폴백합니다(좁히지 않는다).');
    execFileSync('npx', ['vitest', 'run'], { stdio: 'inherit' });
  } else {
    // 2단계: --related 가 변경 파일을 import하는 상위 모듈의 테스트까지 넓힌다.
    // `related`는 플래그가 아니라 **서브커맨드**다(vitest 4.1 실측 — `--related`는 Unknown option).
    console.log('[sanity] vitest related 로 역참조 확장합니다.');
    execFileSync('npx', ['vitest', 'related', '--run', ...files], { stdio: 'inherit' });
  }
  process.exit(0);
}

// 3단계: 관련 페이지의 @e2e-mock 만. @e2e-live 는 대상이 아니다.
const specDir = 'e2e';
const specs = readdirSync(specDir).filter((f) => f.endsWith('.spec.ts'));
const matched = new Set();
for (const spec of specs) {
  const src = readFileSync(path.join(specDir, spec), 'utf8');
  for (const file of files) {
    const stem = path.basename(file).replace(/\.(ts|tsx)$/, '');
    // ① 스펙이 그 모듈을 직접 import  ② 파일명 미러
    if (src.includes(`/${stem}`) || spec.toLowerCase().includes(stem.toLowerCase())) {
      matched.add(spec);
    }
  }
}

if (matched.size === 0) {
  console.log('[sanity] 관련 스펙을 확신할 수 없습니다 — @e2e-mock 전량으로 폴백합니다(의도된 폴백).');
  execFileSync('npx', ['playwright', 'test', '--grep', '@e2e-mock'], { stdio: 'inherit' });
} else {
  const list = [...matched];
  console.log(`[sanity] 매핑된 스펙 ${list.length}건: ${list.join(', ')}`);
  execFileSync('npx', ['playwright', 'test', ...list.map((s) => path.join(specDir, s)), '--grep', '@e2e-mock'], {
    stdio: 'inherit',
  });
}

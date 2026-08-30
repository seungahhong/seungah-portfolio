import { defineConfig, devices } from '@playwright/test';

/**
 * E2E 모드 스위치 — 스펙은 한 벌이고, 외부 API 경계만 모드가 가른다.
 *
 * - 기본(`E2E_MODE` 미설정) = **mock**: `e2e/fixtures/api.ts`가 /api/* 를 fixture로 가로챈다.
 * - `E2E_MODE=live`         = **live**: 가로채지 않고 실제 Groq·Gmail로 나간다(수동 on-demand).
 *
 * live는 CI 고정 스테이지를 갖지 않는다.
 * 수동 실행: `E2E_MODE=live pnpm test:e2e --grep @e2e-live`
 */
const isLive = process.env.E2E_MODE === 'live';

/**
 * E2E 전용 포트 — dev 서버(3000)와 절대 겹치지 않게 둔다.
 *
 * 겹치면 `reuseExistingServer`가 dev 서버를 테스트 대상으로 삼아버리고, 그때부터 이 스위트는
 * **프로덕션 빌드가 아니라 dev를 검증한다**. 실제로 그 사고가 났다: `pnpm dev`가 떠 있으면
 * `[AC-2.3]`(프로덕션에서만 재현되는 알려진 결함)이 dev에서는 통과해
 * `test.fail()`이 '예상과 달리 통과'로 뒤집히며 `pnpm test:regression`이 실패했다.
 *
 * 이 저장소의 오라클은 산출물이다 — 조용히 dev를 대신 재는 것이 실패보다 나쁘다.
 * `verify-runtime.mjs`가 VERIFY_PORT(3939)를 쓰는 것과 같은 이유·같은 관례다.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;

/**
 * E2E 전용 산출물 디렉터리 — dev 서버와 `.next`를 공유하지 않기 위해서다.
 * 포트만 갈라도 두 프로세스가 같은 디렉터리에 쓰면 청크가 섞인다(실측: [AC-5.9] 1회 타임아웃).
 */
const DIST_DIR = process.env.E2E_DIST_DIR ?? '.next-e2e';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // prebuild 게이트(arch-guard·i18n-guard)를 우회하지 않으려고 build를 그대로 부른다.
    // build와 start가 한 명령 안에 있어야 NEXT_DIST_DIR을 같은 값으로 본다 —
    // 어긋나면 start가 산출물을 못 찾는다.
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: BASE_URL,
    // 항상 새로 빌드해서 띄운다. 남아 있는 서버를 재사용하면 낡은 산출물을 재게 되고,
    // 그것은 이 하네스가 막으려는 바로 그 실패 모드다(로컬과 CI가 같은 경로를 타야 한다).
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      NEXT_DIST_DIR: DIST_DIR,
      // live 모드에서만 실제 자격증명을 넘긴다.
      ...(isLive ? {} : { GROQ_API_KEY: '', GMAIL_USER: '', GMAIL_PASS: '' }),
    },
  },
});

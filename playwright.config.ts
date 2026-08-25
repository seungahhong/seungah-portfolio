import { defineConfig, devices } from '@playwright/test';

/**
 * E2E 모드 스위치 — 스펙은 한 벌이고, 외부 API 경계만 모드가 가른다.
 *
 * - 기본(`E2E_MODE` 미설정) = **mock**: `e2e/fixtures/api.ts`가 /api/* 를 fixture로 가로챈다.
 * - `E2E_MODE=live`         = **live**: 가로채지 않고 실제 Groq·Gmail로 나간다(수동 on-demand).
 *
 * live는 CI 고정 스테이지를 갖지 않는다. `pnpm test:e2e:live`로만 실행한다.
 */
const isLive = process.env.E2E_MODE === 'live';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // prebuild 게이트(arch-guard·i18n-guard)를 우회하지 않으려고 build를 그대로 부른다.
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // live 모드에서만 실제 자격증명을 넘긴다.
    env: isLive ? {} : { GROQ_API_KEY: '', GMAIL_USER: '', GMAIL_PASS: '' },
  },
});

import { test, expect } from '@playwright/test';
import { routeApi, isLiveMode, CHAT_REPLY } from './fixtures/api';
import { t } from '../src/lib/i18n/t';

test.beforeEach(async ({ page }) => routeApi(page));

/**
 * 스펙은 한 벌이고 모드 태그가 분기한다.
 * - `@e2e-mock`  : fixture 응답으로 결정론 실행 (CI 기본)
 * - `@e2e-live`  : 실제 Groq 연동 확인 — `pnpm test:e2e:live`로만, 수동 on-demand
 *
 * ⚠️ mock 통과는 연동 검증이 아니다. fixture는 캡처 시점 스냅샷이다.
 */
test('[AC-5.9] 챗 탭에서 메시지를 보내면 응답이 화면에 나타난다', { tag: ['@e2e-mock', '@e2e-live'] }, async ({ page }) => {
  await page.goto('/?tab=chat');

  const input = page.getByRole('textbox').first();
  await input.fill('안녕하세요');
  await input.press('Enter');

  if (isLiveMode) {
    // 실제 응답 내용은 예측할 수 없다 — 비어있지 않은 응답이 도착하는지만 본다.
    await expect(page.getByText(/\S/).last()).toBeVisible({ timeout: 30_000 });
  } else {
    await expect(page.getByText(CHAT_REPLY)).toBeVisible();
  }
});

test('[AC-5.10] 보낸 메시지가 대화에 남는다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  await page.goto('/?tab=chat');
  const input = page.getByRole('textbox').first();
  await input.fill('경력이 궁금합니다');
  await input.press('Enter');
  await expect(page.getByText('경력이 궁금합니다')).toBeVisible();
});

// ADR 0005 — 자격증명이 없으면 죽는 대신 축소한다.
test('[AC-5.11] 자격증명이 없으면 챗이 비활성 안내를 띄운다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  // 이 시나리오만 available:false로 되돌린다 (webServer는 이미 빈 자격증명으로 떠 있다).
  await page.route('**/api/chat', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ json: { available: false } })
      : route.fulfill({ status: 503, json: { available: false } })
  );
  await page.goto('/?tab=chat');
  await expect(page.getByText(t('ko', 'chat.unavailable'))).toBeVisible();
});

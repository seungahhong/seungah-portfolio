import { test, expect } from '@playwright/test';
import { routeApi, isLiveMode } from './fixtures/api';
import { t } from '../src/lib/i18n/t';

test.beforeEach(async ({ page }) => routeApi(page));

/**
 * `@e2e-live`는 **실제 메일을 발송한다**. CI 고정 스테이지에 넣지 않고
 * `pnpm test:e2e:live`로만 수동 실행한다.
 */
test('[AC-7.9] 연락 폼을 제출하면 결과 안내가 나온다', { tag: ['@e2e-mock', '@e2e-live'] }, async ({ page }) => {
  // ContactSection의 실제 소비처는 PortfolioContent(홈)다.
  // `/contact` 페이지는 i18n을 쓰지 않는 **별도의 인라인 폼**이므로 대상이 아니다(src/CLAUDE.md 기록).
  await page.goto('/');

  await page.getByRole('textbox', { name: t('ko', 'contact.name') }).fill('홍길동');
  await page.getByRole('textbox', { name: t('ko', 'contact.email') }).fill('test@example.com');
  await page.getByRole('textbox', { name: t('ko', 'contact.message') }).fill('E2E 검증용 메시지입니다');
  await page.getByRole('button', { name: t('ko', 'contact.submit') }).click();

  const section = page.getByRole('region', { name: t('ko', 'contact.title') });
  if (isLiveMode) {
    // 실제 발송은 성공(200)이거나 자격증명 부재(503)다 — 둘 다 안내가 떠야 한다.
    await expect(section.getByRole('status')).toBeVisible({ timeout: 30_000 });
  } else {
    await expect(section.getByRole('status')).toHaveText(t('ko', 'contact.success'));
  }
});

// 서버로 나가기 전에 클라이언트가 먼저 막는다.
test('[AC-7.10] 필수값이 비면 제출이 막히고 오류가 표시된다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: t('ko', 'contact.submit') }).click();
  // 연락 섹션으로 스코프한다 — 페이지 전역 alert에는 Next의 라우트 안내자도 포함된다.
  const contactSection = page.getByRole('region', { name: t('ko', 'contact.title') });
  await expect(contactSection.getByRole('alert')).toBeVisible();
});

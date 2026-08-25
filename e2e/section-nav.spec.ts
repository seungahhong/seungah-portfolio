import { test, expect } from '@playwright/test';
import { routeApi } from './fixtures/api';
import { SECTIONS } from '../src/lib/sections';
import { t } from '../src/lib/i18n/t';

test.beforeEach(async ({ page }) => routeApi(page));

/**
 * 스크롤·IntersectionObserver 타이밍에 의존하므로 **게이트에서 빼 nightly로 미룬다**.
 * (jsdom에는 IntersectionObserver가 없어 Integration으로는 원리적으로 검증할 수 없다.)
 */
test('[AC-6.1] 섹션으로 스크롤하면 목차의 활성 항목이 따라온다', { tag: ['@nightly', '@e2e-mock'] }, async ({ page }) => {
  await page.goto('/');

  for (const section of ['career', 'faq'] as const) {
    await page.locator(`#${section}`).scrollIntoViewIfNeeded();
    const label = t('ko', SECTIONS.find((s) => s.id === section)!.labelKey);
    // exact: true 필수 — 부분 일치면 FAQ 앵커(aria-label="총 경력과…")까지 함께 잡힌다.
    await expect(page.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'aria-current',
      'true',
      { timeout: 10_000 }
    );
  }
});

test('[AC-6.2] 모든 섹션 앵커가 실제로 문서에 존재한다', { tag: ['@nightly', '@e2e-mock'] }, async ({ page }) => {
  await page.goto('/');
  for (const section of SECTIONS) {
    await expect(page.locator(`#${section.id}`)).toHaveCount(1);
  }
});

import { test, expect } from '@playwright/test';
import { routeApi } from './fixtures/api';
import { t } from '../src/lib/i18n/t';

test.beforeEach(async ({ page }) => routeApi(page));

const toggle = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: t('ko', 'theme.toggle') });

test('[AC-4.1] 테마 토글이 문서 테마를 전환한다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.getAttribute('class');

  await toggle(page).click();

  await expect(html).not.toHaveClass(before ?? '');
  await expect(html).toHaveClass(/dark|light/);
});

// next-themes가 선택을 저장하지 않으면 새로고침마다 눈이 부신다.
test('[AC-4.2] 선택한 테마가 새로고침 후에도 유지된다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  await page.goto('/');
  await toggle(page).click();
  const chosen = await page.locator('html').getAttribute('class');

  await page.reload();

  await expect(page.locator('html')).toHaveClass(chosen ?? '');
});

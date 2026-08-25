import { test, expect } from '@playwright/test';
import { routeApi } from './fixtures/api';
import { t } from '../src/lib/i18n/t';

test.beforeEach(async ({ page }) => routeApi(page));

/**
 * 언어 토글은 상태 토글이 아니라 같은 문서의 다른 언어 URL로 가는 링크다
 * (크롤러가 두 언어 버전의 관계를 따라갈 수 있어야 한다).
 */
test('[AC-3.1] 상세 페이지에서 언어를 바꾸면 같은 문서의 영어 URL로 이동한다', { tag: ['@smoke', '@e2e-mock'] }, async ({ page }) => {
  await page.goto('/career/wadiz');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');

  await page.getByRole('link', { name: t('ko', 'lang.switchTo') }).click();

  await expect(page).toHaveURL(/\/en\/career\/wadiz$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('[AC-3.2] 영어에서 한국어로 되돌아오면 원래 경로가 된다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  await page.goto('/en/career/wadiz');
  await page.getByRole('link', { name: t('en', 'lang.switchTo') }).click();
  await expect(page).toHaveURL(/\/career\/wadiz$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
});

// 링크여야 새 탭 열기·주소 공유·크롤러 추적이 성립한다. 버튼이면 전부 깨진다.
test('[AC-3.3] 언어 전환은 href를 가진 링크다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('link', { name: t('ko', 'lang.switchTo') });
  await expect(toggle).toHaveAttribute('href', '/en');
  await expect(toggle).toHaveAttribute('hreflang', 'en');
});

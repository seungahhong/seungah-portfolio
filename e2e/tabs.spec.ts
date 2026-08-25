import { test, expect } from '@playwright/test';
import { routeApi } from './fixtures/api';
import { t } from '../src/lib/i18n/t';

const PORTFOLIO = t('ko', 'nav.tab.portfolio');
const CHAT = t('ko', 'nav.tab.chat');

test.beforeEach(async ({ page }) => routeApi(page));

// showstopper만 본다 — 홈이 뜨고 두 탭이 전환되는가. 얕은 reachability다.
test('[AC-1.10] 홈에서 두 탭이 보이고 챗 탭으로 전환된다', { tag: ['@smoke', '@e2e-mock'] }, async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('tab', { name: PORTFOLIO })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: CHAT }).click();
  await expect(page.getByRole('tab', { name: CHAT })).toHaveAttribute('aria-selected', 'true');
});

test('[AC-1.11] 실제 브라우저에서 화살표 키로 탭이 이동한다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: PORTFOLIO }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: CHAT })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', { name: CHAT })).toBeFocused();
});

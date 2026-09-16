import { test, expect } from '@playwright/test';
import { routeApi } from './fixtures/api';
import { t } from '../src/lib/i18n/t';

const PORTFOLIO = t('ko', 'nav.tab.portfolio');
const CHAT = t('ko', 'nav.tab.chat');

test.beforeEach(async ({ page }) => routeApi(page));

/**
 * ADR 0002 — 탭 상태를 useSearchParams가 아니라 마운트 후 window.location에서 읽는다.
 * 그 대가로 ?tab=chat 직접 진입 시 첫 프레임은 포트폴리오이고 하이드레이션 후 전환된다.
 * 아래 단정들은 그 '하이드레이션 후' 상태를 기다린다(의도된 트레이드오프).
 */
test('[AC-2.1] ?tab=chat으로 진입하면 하이드레이션 후 챗 탭이 활성이다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  await page.goto('/?tab=chat');
  await expect(page.getByRole('tab', { name: CHAT })).toHaveAttribute('aria-selected', 'true');
});

test('[AC-2.2] 파라미터가 없으면 포트폴리오가 기본이다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('tab', { name: PORTFOLIO })).toHaveAttribute('aria-selected', 'true');
});

/**
 * 한때 알려진 결함이었다 — `router.replace(pathname)`의 의도가 명백한데도 URL에 `?tab=chat`이
 * 남아, 그 주소를 공유하면 상대방이 챗 탭으로 열게 됐다. Next 16.2.1까지 재현됐고
 * `test.fail()`로 기록해 두었다.
 *
 * **Next 16.3.5에서 고쳐졌다**(실측: 프로덕션 빌드 대상 3/3 통과). 기록대로 `test.fail()`을 지웠고,
 * 이제 이 단정은 회귀 감시로 남는다 — 다시 깨지면 그냥 실패한다.
 */
test('[AC-2.3] 포트폴리오로 돌아오면 tab 파라미터가 URL에서 제거된다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  await page.goto('/?tab=chat');
  await expect(page.getByRole('tab', { name: CHAT })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: PORTFOLIO }).click();
  await expect(page).toHaveURL((url) => !url.searchParams.has('tab'));
});

/**
 * jsdom에서는 재현할 수 없는 경로 — Row 8이 라우터를 double로 바꾸며 검증 범위 밖으로 남긴 부분이다.
 *
 * 탭 클릭은 `router.replace`라 히스토리 항목을 만들지 않는다. 따라서 popstate를 일으키려면
 * 실제 내비게이션 두 번이 필요하다(그것이 이 리스너가 존재하는 실제 상황이기도 하다).
 */
test('[AC-2.4] 뒤로가기(popstate)가 탭 상태를 URL과 다시 일치시킨다', { tag: ['@e2e-mock'] }, async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('tab', { name: PORTFOLIO })).toHaveAttribute('aria-selected', 'true');

  await page.goto('/?tab=chat');
  await expect(page.getByRole('tab', { name: CHAT })).toHaveAttribute('aria-selected', 'true');

  await page.goBack();
  await expect(page).toHaveURL((url) => !url.searchParams.has('tab'));
  await expect(page.getByRole('tab', { name: PORTFOLIO })).toHaveAttribute('aria-selected', 'true');
});

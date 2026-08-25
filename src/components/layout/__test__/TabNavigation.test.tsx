import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabNavigation } from '../TabNavigation';
import { TabProvider } from '@/components/providers/TabContext';
import { I18nProvider } from '@/lib/i18n/provider';
import { t } from '@/lib/i18n/t';

/**
 * next/navigation 모듈 double.
 * TabProvider가 router.replace로 URL을 갱신하는데, 그건 프레임워크 경계라
 * jsdom에서 재현할 수 없다. 실제 URL 반영·popstate는 Row 12(E2E)가 검증한다.
 */
const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn(), refresh: vi.fn() }),
}));

const PORTFOLIO = t('ko', 'nav.tab.portfolio');
const CHAT = t('ko', 'nav.tab.chat');

function renderTabs() {
  return render(
    <I18nProvider locale="ko">
      <TabProvider>
        <TabNavigation />
      </TabProvider>
    </I18nProvider>
  );
}

const tab = (name: string) => screen.getByRole('tab', { name });

beforeEach(() => replaceMock.mockClear());

describe('TabNavigation — WAI-ARIA Tabs 구조', () => {
  it('[AC-1.1] tablist와 두 개의 tab을 접근 가능한 이름과 함께 노출한다', () => {
    renderTabs();
    expect(screen.getByRole('tablist', { name: t('ko', 'nav.tablist') })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(tab(PORTFOLIO)).toBeInTheDocument();
    expect(tab(CHAT)).toBeInTheDocument();
  });

  // ADR 0003 — 챗이 기본이면 SSR 본문이 hidden으로 노출돼 크롤러가 저평가한다.
  it('[AC-1.2] 기본 활성 탭은 포트폴리오다', () => {
    renderTabs();
    expect(tab(PORTFOLIO)).toHaveAttribute('aria-selected', 'true');
    expect(tab(CHAT)).toHaveAttribute('aria-selected', 'false');
  });

  it('[AC-1.3] roving tabindex — 활성 0 / 비활성 -1', () => {
    renderTabs();
    expect(tab(PORTFOLIO)).toHaveAttribute('tabindex', '0');
    expect(tab(CHAT)).toHaveAttribute('tabindex', '-1');
  });

  it('[AC-1.4] 각 탭이 대응하는 패널을 aria-controls로 가리킨다', () => {
    renderTabs();
    // 패널 자체는 다른 컴포넌트가 렌더한다. 여기서는 연결 규약만 본다
    // (실제 패널 존재 여부는 verify:runtime V4가 배포 HTML에서 검사한다).
    expect(tab(PORTFOLIO)).toHaveAttribute('aria-controls', 'tabpanel-portfolio');
    expect(tab(CHAT)).toHaveAttribute('aria-controls', 'tabpanel-chat');
  });
});

describe('TabNavigation — 키보드 이동', () => {
  it('[AC-1.5] ArrowRight가 다음 탭으로 이동한다', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(tab(PORTFOLIO));
    await user.keyboard('{ArrowRight}');
    expect(tab(CHAT)).toHaveAttribute('aria-selected', 'true');
  });

  it('[AC-1.6] ArrowLeft가 순환한다 — 첫 탭에서 누르면 마지막 탭', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(tab(PORTFOLIO));
    await user.keyboard('{ArrowLeft}');
    expect(tab(CHAT)).toHaveAttribute('aria-selected', 'true');
  });

  it('[AC-1.7] Home은 첫 탭, End는 마지막 탭으로 간다', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(tab(PORTFOLIO));
    await user.keyboard('{End}');
    expect(tab(CHAT)).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Home}');
    expect(tab(PORTFOLIO)).toHaveAttribute('aria-selected', 'true');
  });

  // 키보드 사용자가 이동한 곳에 포커스가 따라가지 않으면 다음 키 입력이 먹지 않는다.
  it('[AC-1.8] 키보드로 이동하면 포커스가 새 활성 탭을 따라간다', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(tab(PORTFOLIO));
    await user.keyboard('{ArrowRight}');
    expect(tab(CHAT)).toHaveFocus();
  });

  it('[AC-1.9] 이동하면 roving tabindex가 함께 갱신된다', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(tab(PORTFOLIO));
    await user.keyboard('{ArrowRight}');
    expect(tab(CHAT)).toHaveAttribute('tabindex', '0');
    expect(tab(PORTFOLIO)).toHaveAttribute('tabindex', '-1');
  });
});

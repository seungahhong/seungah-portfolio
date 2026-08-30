'use client';
// SiteHeader는 'use client' 모듈이다 — arch-guard R2 대응(vitest에서는 no-op).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteHeader } from '../SiteHeader';
import { TabProvider } from '@/components/providers/TabContext';
import { I18nProvider } from '@/lib/i18n/provider';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/**
 * API 경계: mock · ② 모듈 double(next/navigation).
 * 네트워크 호출은 없다. 실제 라우팅·history 반영은 검증 범위 밖이다(E2E 소관).
 */
const nav = vi.hoisted(() => ({ pathname: '/', replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ replace: nav.replace, push: vi.fn(), refresh: vi.fn() }),
}));

function renderHeader(pathname: string, locale: Locale = 'ko') {
  nav.pathname = pathname;
  window.history.replaceState({}, '', pathname);
  return render(
    <I18nProvider locale={locale}>
      <TabProvider>
        <SiteHeader />
      </TabProvider>
    </I18nProvider>
  );
}

/** 2행 = 섹션 목차. 있으면 헤더 92px, 없으면 48px (ui-conventions) */
const sectionNav = (locale: Locale = 'ko') =>
  screen.queryByRole('navigation', { name: t(locale, 'nav.sections') });

beforeEach(() => {
  nav.replace.mockClear();
  nav.pathname = '/';
});

describe('SiteHeader — 2행(섹션 목차)의 등장 조건', () => {
  it('[AC-17.1] 홈의 포트폴리오 탭에서는 탭과 섹션 목차가 함께 보인다', () => {
    renderHeader('/');
    expect(screen.getByRole('tablist', { name: t('ko', 'nav.tablist') })).toBeInTheDocument();
    expect(sectionNav()).toBeInTheDocument();
  });

  it('[AC-17.2] 챗 탭으로 바꾸면 섹션 목차 행이 사라진다', async () => {
    const user = userEvent.setup();
    renderHeader('/');

    await user.click(screen.getByRole('tab', { name: t('ko', 'nav.tab.chat') }));

    // ADR 0002가 기록한 트레이드오프 — 이 행이 사라지며 헤더가 44px 줄어든다
    expect(sectionNav()).not.toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: t('ko', 'nav.tablist') })).toBeInTheDocument();
  });

  it('[AC-17.3] 상세 페이지에서는 탭 대신 홈으로 돌아가는 링크가 온다', () => {
    renderHeader('/career/wadiz');
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(sectionNav()).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('ko', 'nav.backToPortfolio') })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('[AC-17.4] /en도 홈이다 — 영어 홈에서도 탭과 섹션 목차가 보인다', () => {
    // neutralPath로 로케일을 벗겨 판정하지 않으면 영어 홈이 상세 페이지로 오인된다
    renderHeader('/en', 'en');
    expect(screen.getByRole('tablist', { name: t('en', 'nav.tablist') })).toBeInTheDocument();
    expect(sectionNav('en')).toBeInTheDocument();
  });
});

describe('SiteHeader — 접근성', () => {
  it('[AC-17.5] 스킵 링크가 문서의 첫 링크이고 본문 앵커를 가리킨다', () => {
    renderHeader('/');
    const first = screen.getAllByRole('link')[0];
    expect(first).toHaveAccessibleName(t('ko', 'nav.skipToContent'));
    expect(first).toHaveAttribute('href', '#main-content');
  });
});

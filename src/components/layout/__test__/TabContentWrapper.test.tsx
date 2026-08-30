'use client';
// TabContentWrapper·useTab은 'use client' 모듈의 export다 — arch-guard R2 대응(vitest에서는 no-op).

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { TabContentWrapper } from '../TabContentWrapper';
import { TabNavigation } from '../TabNavigation';
import { TabProvider } from '@/components/providers/TabContext';
import { I18nProvider } from '@/lib/i18n/provider';
import { t } from '@/lib/i18n/t';

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn() }),
}));

/**
 * API 경계: mock · ① 네트워크 인터셉터(MSW). 실제 API로 나가지 않는다.
 * 자식 ChatTab이 마운트되며 GET /api/chat을 부른다 — 이 행의 검증 대상이 아니므로
 * 라우트 계약(`{ available: boolean }`)에 맞는 최소 응답만 돌려준다. fixture는 두지 않는다.
 * 축소 계약(available:false일 때의 화면)은 AC-25가 본다.
 */
const CHAT_ENDPOINT = new URL('/api/chat', window.location.origin).toString();
const server = setupServer(
  http.get(CHAT_ENDPOINT, () => HttpResponse.json({ available: false }))
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const PORTFOLIO = t('ko', 'nav.tab.portfolio');
const CHAT = t('ko', 'nav.tab.chat');
/** 포트폴리오 패널의 children이 실제로 살아 있는지 보기 위한 표식 */
const BODY_MARK = '포트폴리오 본문 표식';

function renderShell() {
  return render(
    <I18nProvider locale="ko">
      <TabProvider>
        <TabNavigation />
        <TabContentWrapper locale="ko">
          <p>{BODY_MARK}</p>
        </TabContentWrapper>
      </TabProvider>
    </I18nProvider>
  );
}

const panel = (name: string) => screen.getByRole('tabpanel', { name });
const tab = (name: string) => screen.getByRole('tab', { name });

beforeEach(() => {
  replace.mockClear();
  window.history.replaceState({}, '', '/');
});

describe('TabContentWrapper — 두 패널은 항상 DOM에 있다 (ADR 0003)', () => {
  it('[AC-16.1] 활성 여부와 무관하게 두 tabpanel이 모두 존재한다', () => {
    renderShell();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(2);
    expect(panel(PORTFOLIO)).toBeInTheDocument();
    expect(panel(CHAT)).toBeInTheDocument();
  });

  it('[AC-16.2] 챗으로 전환해도 포트폴리오 본문은 unmount되지 않고 CSS로만 감춰진다', async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(tab(CHAT));

    // 크롤러가 보는 HTML은 활성 탭에 따라 달라지지 않아야 한다 — 조건부 렌더링이면 이 줄이 깨진다
    expect(screen.getByText(BODY_MARK)).toBeInTheDocument();
    expect(panel(PORTFOLIO)).toHaveClass('hidden');
    expect(panel(CHAT)).not.toHaveClass('hidden');
  });

  it('[AC-16.3] 탭의 aria-controls와 패널의 aria-labelledby가 서로를 가리킨다', () => {
    renderShell();
    // AC-1.4는 탭 쪽만 본다("패널은 다른 컴포넌트가 렌더한다"). 여기서 그 반대편을 닫는다.
    for (const name of [PORTFOLIO, CHAT]) {
      const controlled = document.getElementById(tab(name).getAttribute('aria-controls')!);
      expect(controlled).toHaveAttribute('role', 'tabpanel');
      expect(controlled).toHaveAttribute('aria-labelledby', tab(name).id);
    }
  });

  it('[AC-16.4] 포트폴리오가 활성인 동안에도 챗 본문이 이미 마운트돼 있다', async () => {
    // 챗 탭의 대화 상태 보존이 성립하려면 처음부터 마운트돼 있어야 한다
    renderShell();
    expect(
      await screen.findByRole('heading', { name: t('ko', 'chat.tab.welcomeTitle') })
    ).toBeInTheDocument();
  });
});

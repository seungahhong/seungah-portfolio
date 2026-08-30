'use client';
// TabContext는 'use client' 모듈이고 useTab은 컴포넌트가 아닌 export(훅)다.
// 지시어가 없으면 arch-guard R2가 '서버 모듈이 클라이언트 값을 import했다'로 판정한다.
// vitest에서 이 지시어는 무해한 no-op이다.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabProvider, useTab } from '../TabContext';

/**
 * API 경계: mock · ② 모듈 double(next/navigation).
 * 실제 라우터가 replace()를 history에 어떻게 반영하는지는 검증 범위 밖이다 —
 * 여기서 보는 것은 "이 프로바이더가 라우터에 무엇을 요구하는가"까지다.
 */
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

/** 커밋된 activeTab을 렌더 순서대로 기록한다 — ADR 0002의 '첫 프레임' 트레이드오프를 관측하기 위해서다 */
function Probe({ seen }: { seen: string[] }) {
  const { activeTab, setActiveTab } = useTab();
  seen.push(activeTab);
  return (
    <>
      <output>{activeTab}</output>
      <button onClick={() => setActiveTab('chat')}>to-chat</button>
      <button onClick={() => setActiveTab('portfolio')}>to-portfolio</button>
    </>
  );
}

function renderAt(url: string) {
  window.history.replaceState({}, '', url);
  const seen: string[] = [];
  render(
    <TabProvider>
      <Probe seen={seen} />
    </TabProvider>
  );
  return seen;
}

const activeTab = () => screen.getByRole('status').textContent;
const toChat = () => screen.getByRole('button', { name: 'to-chat' });
const toPortfolio = () => screen.getByRole('button', { name: 'to-portfolio' });

beforeEach(() => {
  replace.mockClear();
  window.history.replaceState({}, '', '/');
});

describe('TabProvider — URL이 탭 상태의 출처다', () => {
  it('[AC-15.1] tab 파라미터가 없으면 포트폴리오가 활성이다', () => {
    renderAt('/');
    expect(activeTab()).toBe('portfolio');
  });

  it('[AC-15.2] ?tab=chat은 첫 프레임에 포트폴리오였다가 마운트 후 챗이 된다', () => {
    // ADR 0002가 의도적으로 수용한 트레이드오프다.
    // 첫 커밋이 chat이 되면 useSearchParams로 되돌아갔다는 뜻이고, 그 순간 정적 HTML이 빈다.
    const seen = renderAt('/?tab=chat');
    expect(seen[0]).toBe('portfolio');
    expect(activeTab()).toBe('chat');
  });

  it('[AC-15.3] 알 수 없는 tab 값은 포트폴리오로 떨어진다', () => {
    renderAt('/?tab=bogus');
    expect(activeTab()).toBe('portfolio');
  });

  it('[AC-15.4] popstate가 탭 상태를 URL과 다시 일치시킨다', () => {
    renderAt('/');
    act(() => {
      window.history.replaceState({}, '', '/?tab=chat');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(activeTab()).toBe('chat');
  });
});

describe('TabProvider — URL 갱신', () => {
  it('[AC-15.5] 챗으로 가면 tab이 붙고, 포트폴리오로 돌아오면 제거된다', async () => {
    const user = userEvent.setup();
    renderAt('/');

    await user.click(toChat());
    expect(replace).toHaveBeenLastCalledWith('/?tab=chat', { scroll: false });

    await user.click(toPortfolio());
    // 기본 탭은 파라미터를 남기지 않는다 — 공유되는 주소가 항상 정본이어야 한다
    expect(replace).toHaveBeenLastCalledWith('/', { scroll: false });
  });

  it('[AC-15.6] tab 외의 쿼리 파라미터는 보존한다', async () => {
    const user = userEvent.setup();
    renderAt('/?utm_source=blog');

    await user.click(toChat());
    expect(replace).toHaveBeenLastCalledWith('/?utm_source=blog&tab=chat', { scroll: false });

    await user.click(toPortfolio());
    expect(replace).toHaveBeenLastCalledWith('/?utm_source=blog', { scroll: false });
  });
});

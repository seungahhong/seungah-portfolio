'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type TabType = 'portfolio' | 'chat';

/**
 * 기본 탭은 포트폴리오다.
 *
 * 챗 탭이 기본이면 SSR로 렌더링된 포트폴리오 본문이 `hidden` 상태로 노출되어
 * 검색엔진·AI 크롤러가 본문을 저평가한다. 챗은 `?tab=chat`으로 진입한다.
 */
const DEFAULT_TAB: TabType = 'portfolio';

function resolveTab(value: string | null): TabType {
  return value === 'chat' ? 'chat' : DEFAULT_TAB;
}

interface TabContextValue {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabCtx = createContext<TabContextValue>({
  activeTab: DEFAULT_TAB,
  setActiveTab: () => {},
});

export function useTab() {
  return useContext(TabCtx);
}

/**
 * 탭 상태 제공자.
 *
 * 쿼리스트링은 `useSearchParams` 대신 마운트 이후 `window.location`에서 읽는다.
 * `useSearchParams`는 정적 생성 페이지에서 상위 Suspense 경계를 폴백으로 떨어뜨려
 * HTML 본문이 통째로 비어버리게 만들기 때문이다. (프로바이더가 앱 최상단에 있어 영향 범위가 전체다.)
 */
export function TabProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState<TabType>(DEFAULT_TAB);

  useEffect(() => {
    const syncFromUrl = () => {
      setActiveTabState(resolveTab(new URLSearchParams(window.location.search).get('tab')));
    };

    syncFromUrl();
    // 뒤로/앞으로 이동 시에도 탭 상태를 URL과 일치시킨다
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const setActiveTab = useCallback(
    (tab: TabType) => {
      setActiveTabState(tab);

      const params = new URLSearchParams(window.location.search);
      if (tab === DEFAULT_TAB) {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const query = params.toString();
      router.replace(query ? `${window.location.pathname}?${query}` : window.location.pathname, {
        scroll: false,
      });
    },
    [router]
  );

  return <TabCtx.Provider value={{ activeTab, setActiveTab }}>{children}</TabCtx.Provider>;
}

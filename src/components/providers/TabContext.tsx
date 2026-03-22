'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export type TabType = 'portfolio' | 'chat';

interface TabContextValue {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabCtx = createContext<TabContextValue>({
  activeTab: 'chat',
  setActiveTab: () => {},
});

export function useTab() {
  return useContext(TabCtx);
}

function TabProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get('tab') === 'portfolio' ? 'portfolio' : 'chat';
  const [activeTab, setActiveTabState] = useState<TabType>(initialTab);

  const setActiveTab = useCallback((tab: TabType) => {
    setActiveTabState(tab);
    const params = new URLSearchParams(window.location.search);
    if (tab === 'chat') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : '/', { scroll: false });
  }, [router]);

  // Sync with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const tab = searchParams.get('tab') === 'portfolio' ? 'portfolio' : 'chat';
    setActiveTabState(tab);
  }, [searchParams]);

  return (
    <TabCtx.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabCtx.Provider>
  );
}

export function TabProvider({ children }: { children: React.ReactNode }) {
  return <TabProviderInner>{children}</TabProviderInner>;
}

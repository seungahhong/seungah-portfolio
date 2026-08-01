'use client';

import { useTab } from '@/components/providers/TabContext';
import { ChatTab } from '@/components/chat/ChatTab';

interface TabContentWrapperProps {
  children: React.ReactNode;
  /** 서버가 결정한 로케일 — 하이드레이션 전에도 챗 탭이 올바른 언어로 렌더링되도록 전달한다 */
  locale: string;
}

export function TabContentWrapper({ children, locale }: TabContentWrapperProps) {
  const { activeTab } = useTab();

  return (
    <>
      {/* Portfolio content - always in DOM for SSR, hidden via CSS */}
      <div
        id="tabpanel-portfolio"
        role="tabpanel"
        aria-labelledby="tab-portfolio"
        className={activeTab === 'portfolio' ? '' : 'hidden'}
      >
        {children}
      </div>

      {/* Chat tab - always mounted for state persistence */}
      <div
        id="tabpanel-chat"
        role="tabpanel"
        aria-labelledby="tab-chat"
        className={activeTab === 'chat' ? 'flex flex-col h-[calc(100dvh-3rem)]' : 'hidden'}
      >
        <ChatTab locale={locale} />
      </div>
    </>
  );
}

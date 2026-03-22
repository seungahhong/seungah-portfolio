'use client';

import { useTab } from '@/components/providers/TabContext';
import { ChatTab } from '@/components/chat/ChatTab';

interface TabContentWrapperProps {
  children: React.ReactNode;
}

export function TabContentWrapper({ children }: TabContentWrapperProps) {
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
        className={activeTab === 'chat' ? 'flex flex-col h-[calc(100vh-3.5rem)]' : 'hidden'}
      >
        <ChatTab />
      </div>
    </>
  );
}

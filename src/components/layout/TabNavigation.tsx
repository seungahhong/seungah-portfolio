'use client';

import { useCallback, KeyboardEvent } from 'react';
import { useTab, TabType } from '@/components/providers/TabContext';
import { useT } from '@/lib/i18n/useT';

/**
 * WAI-ARIA Tabs 패턴의 탭 목록 — iOS 세그먼티드 컨트롤 형태.
 *
 * 이전에는 활성 탭만 옅은 배경을 갖는 평평한 텍스트 버튼이라 "전환 가능한 컨트롤"로 읽히지 않았다.
 * 트랙(움푹한 배경) + 떠 있는 활성 알약 + 아이콘 조합으로 스위처임을 한눈에 알 수 있게 한다.
 *
 * 검색엔진과 AI 크롤러가 첫 화면에서 본문(SSR 포트폴리오)을 읽을 수 있도록
 * 포트폴리오 탭을 첫 번째이자 기본값으로 배치한다.
 */
const TABS: { id: TabType; labelKey: string }[] = [
  { id: 'portfolio', labelKey: 'nav.tab.portfolio' },
  { id: 'chat', labelKey: 'nav.tab.chat' },
];

function TabIcon({ id }: { id: TabType }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  return id === 'portfolio' ? (
    <svg {...common}>
      <rect width="7" height="9" x="3" y="3" rx="1.5" />
      <rect width="7" height="5" x="14" y="3" rx="1.5" />
      <rect width="7" height="9" x="14" y="12" rx="1.5" />
      <rect width="7" height="5" x="3" y="16" rx="1.5" />
    </svg>
  ) : (
    <svg {...common}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function TabNavigation() {
  const { activeTab, setActiveTab } = useTab();
  const { t } = useT();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % TABS.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = TABS.length - 1;
      }

      if (nextIndex !== currentIndex) {
        setActiveTab(TABS[nextIndex].id);
        document.getElementById(`tab-${TABS[nextIndex].id}`)?.focus();
      }
    },
    [activeTab, setActiveTab]
  );

  return (
    <div
      role="tablist"
      aria-label={t('nav.tablist')}
      onKeyDown={handleKeyDown}
      className="flex items-center gap-0.5 p-0.5 rounded-full bg-[var(--segment-track)] border border-[var(--border)]"
    >
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full',
              'transition-all duration-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
              isActive
                ? 'bg-[var(--segment-active)] text-[var(--foreground)] shadow-sm'
                : 'text-[#86868b] hover:text-[var(--foreground)]',
            ].join(' ')}
          >
            <TabIcon id={tab.id} />
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { useCallback, KeyboardEvent } from 'react';
import { useTab, TabType } from '@/components/providers/TabContext';
import { useT } from '@/lib/i18n/useT';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageToggle } from '@/components/layout/LanguageToggle';

const TABS: { id: TabType; labelKey: string }[] = [
  { id: 'chat', labelKey: 'nav.tab.chat' },
  { id: 'portfolio', labelKey: 'nav.tab.portfolio' },
];

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
        const tabEl = document.getElementById(`tab-${TABS[nextIndex].id}`);
        tabEl?.focus();
      }
    },
    [activeTab, setActiveTab]
  );

  return (
    <header className="glass-nav sticky top-0 z-30">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex items-center justify-between h-12">
          {/* Tab list */}
          <div
            role="tablist"
            aria-label="Navigation tabs"
            onKeyDown={handleKeyDown}
            className="flex items-center gap-0.5"
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
                    'relative px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300',
                    isActive
                      ? 'text-[var(--foreground)] bg-[var(--surface-secondary)]'
                      : 'text-[#86868b] hover:text-[var(--foreground)]',
                  ].join(' ')}
                >
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Settings */}
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

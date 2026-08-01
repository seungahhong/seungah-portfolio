'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TabNavigation } from '@/components/layout/TabNavigation';
import { SectionNav } from '@/components/layout/SectionNav';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { useTab } from '@/components/providers/TabContext';
import { useT } from '@/lib/i18n/useT';
import { localizedPath, neutralPath } from '@/lib/i18n/constants';

/**
 * 전역 헤더 (sticky).
 *
 * 1행 — 홈에서는 포트폴리오 / AI 챗 탭, 상세 페이지에서는 홈으로 돌아가는 링크
 * 2행 — 포트폴리오 탭에서만 나타나는 섹션 목차
 *
 * 섹션 목차를 본문이 아닌 헤더에 두어, 어디까지 스크롤하든 항상 상단에 남게 한다.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const { t, locale } = useT();
  const { activeTab } = useTab();

  // `/`와 `/en` 모두 홈이다
  const isHome = neutralPath(pathname) === '/';
  const homeHref = localizedPath(locale, '/');
  const showSectionNav = isHome && activeTab === 'portfolio';

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus:rounded-full focus:bg-[var(--surface)] focus:text-[var(--foreground)] focus:shadow-lg"
      >
        {t('nav.skipToContent')}
      </a>

      <header className="glass-nav sticky top-0 z-30">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex items-center justify-between h-12 gap-4">
            {isHome ? (
              <TabNavigation />
            ) : (
              <Link
                href={homeHref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full text-[#86868b] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-all duration-200"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                {t('nav.backToPortfolio')}
              </Link>
            )}

            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {showSectionNav && (
          <div className="border-t border-[var(--border)]">
            <div className="max-w-[980px] mx-auto px-6">
              <SectionNav />
            </div>
          </div>
        )}
      </header>
    </>
  );
}

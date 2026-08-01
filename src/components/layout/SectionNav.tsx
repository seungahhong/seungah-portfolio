'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/useT';

const SECTIONS = [
  { id: 'about', labelKey: 'nav.about' },
  { id: 'career', labelKey: 'nav.career' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'study', labelKey: 'nav.study' },
  { id: 'faq', labelKey: 'nav.faq' },
  { id: 'contact', labelKey: 'nav.contact' },
] as const;

/**
 * 섹션 목차 — 헤더 두 번째 줄에 상주한다.
 *
 * 헤더가 sticky이므로 아무리 스크롤해도 항상 상단에 남는다.
 * (섹션 안에 두면 그 섹션을 지나는 순간 고정이 풀리므로 헤더로 올렸다.)
 *
 * 스크롤 위치에 따라 현재 섹션을 표시해, 긴 문서에서 지금 어디를 보고 있는지 알 수 있게 한다.
 */
export function SectionNav() {
  const { t } = useT();
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const elements = SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 헤더에 가려지지 않고 화면에 들어온 것 중 가장 위쪽 섹션을 현재 위치로 본다
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // 상단 92px은 sticky 헤더에 가려지는 영역, 하단 55%는 아직 "읽는 중"이 아닌 영역
      { rootMargin: '-92px 0px -55% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label={t('nav.sections')}>
      <ul className="flex items-center gap-1 h-11 overflow-x-auto no-scrollbar">
        {SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          return (
            <li key={section.id} className="shrink-0">
              <a
                href={`#${section.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={[
                  'inline-block px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                  'transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                  isActive
                    ? 'text-[var(--accent)] bg-[var(--surface-secondary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
                ].join(' ')}
              >
                {t(section.labelKey)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

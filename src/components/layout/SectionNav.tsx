'use client';

import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/useT';
import { SECTIONS, isSectionId, sectionPath, type SectionId } from '@/lib/sections';

/**
 * 섹션으로 이동한다.
 *
 * 해시 링크와 달리 브라우저가 대신 스크롤해주지 않으므로 직접 옮긴다.
 * 세로 오프셋은 각 섹션의 `scroll-mt-*`(sticky 헤더 92px 기준)가 담당한다 —
 * `scroll-margin-top`은 `scrollIntoView`에도 그대로 적용된다.
 */
function scrollToSection(id: SectionId) {
  const el = document.getElementById(id);
  if (!el) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

  // 해시 링크가 하던 포커스 이동을 대신한다. 없으면 키보드 사용자는 목차에 갇힌다.
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/**
 * 섹션 목차 — 헤더 두 번째 줄에 상주한다.
 *
 * 헤더가 sticky이므로 아무리 스크롤해도 항상 상단에 남는다.
 * (섹션 안에 두면 그 섹션을 지나는 순간 고정이 풀리므로 헤더로 올렸다.)
 *
 * 스크롤 위치에 따라 현재 섹션을 표시해, 긴 문서에서 지금 어디를 보고 있는지 알 수 있게 한다.
 */
export function SectionNav() {
  const { t, locale } = useT();
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  // 진입 시점과 뒤로/앞으로 이동 시 `?tab=`이 가리키는 섹션으로 이동한다.
  // `useSearchParams`는 정적 페이지를 폴백으로 떨어뜨리므로 `window.location`에서 읽는다.
  useEffect(() => {
    const syncFromUrl = () => {
      const target = new URLSearchParams(window.location.search).get('tab');
      if (isSectionId(target)) scrollToSection(target);
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

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
      // 상단 92px은 sticky 헤더에 가려지는 영역, 하단 55%는 아직 "읽는 중"이 아닌 영역.
      // 92 = 48(1행 h-12, 탭) + 44(2행 h-11, 섹션 목차). 헤더 높이를 바꾸면 이 값만으로 끝나지 않는다 —
      // 섹션의 scroll-mt-28(112px)과 카드·항목의 scroll-mt-32(128px)가 같은 기준을 따르므로 함께 고쳐야 한다
      // (references/ui-conventions.md). 어긋나도 빌드는 통과하고 앵커 위치만 조용히 밀린다.
      { rootMargin: '-92px 0px -55% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => {
      // 새 탭·새 창으로 여는 클릭은 브라우저 기본 동작(주소 그대로 열기)을 남겨둔다
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      // 같은 정적 페이지의 쿼리만 바뀌므로 RSC 왕복 없이 history만 갱신한다
      window.history.pushState(null, '', sectionPath(locale, id));
      scrollToSection(id);
    },
    [locale]
  );

  return (
    <nav aria-label={t('nav.sections')}>
      <ul className="flex items-center gap-1 h-11 overflow-x-auto no-scrollbar">
        {SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          return (
            <li key={section.id} className="shrink-0">
              <a
                href={sectionPath(locale, section.id)}
                onClick={(event) => handleClick(event, section.id)}
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

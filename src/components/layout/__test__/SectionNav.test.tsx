'use client';
// SectionNav는 'use client' 모듈이다 — arch-guard R2 대응(vitest에서는 no-op).

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionNav } from '../SectionNav';
import { I18nProvider } from '@/lib/i18n/provider';
import { SECTIONS, sectionPath } from '@/lib/sections';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/**
 * API 경계: 네트워크 호출 없음. jsdom 미구현 브라우저 API만 스텁한다.
 * 검증 범위 밖 — IntersectionObserver의 실제 교차 판정(rootMargin -92px), prefers-reduced-motion
 * 실제 질의, 실제 스크롤 위치. 활성 항목 추적은 e2e [AC-6.1](@nightly)이 브라우저에서 본다.
 */
const scrollIntoView = vi.fn();

beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
  );
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }));
  Element.prototype.scrollIntoView = scrollIntoView;
});

function renderNav(locale: Locale = 'ko', url = '/') {
  window.history.replaceState({}, '', url);
  return render(
    <I18nProvider locale={locale}>
      <SectionNav />
      {/* 실제 페이지처럼 섹션 앵커를 함께 둔다 — 없으면 스크롤·포커스 경로가 전혀 돌지 않는다 */}
      {SECTIONS.map((section) => (
        <section key={section.id} id={section.id}>
          {section.id}
        </section>
      ))}
    </I18nProvider>
  );
}

const sectionLink = (locale: Locale, id: string) =>
  screen.getByRole('link', { name: t(locale, SECTIONS.find((s) => s.id === id)!.labelKey) });

/**
 * 클릭 후 "컴포넌트가 기본 동작을 막았는가"를 그대로 보고한다.
 * document 리스너는 React(컨테이너)보다 뒤에 버블로 도달하므로 컴포넌트의 판단을 읽을 수 있고,
 * 여기서 preventDefault를 걸어 jsdom이 실제 내비게이션을 시도하지 않게 한다.
 */
function clickAndReportPrevented(el: HTMLElement, init: MouseEventInit = {}) {
  let preventedByComponent = false;
  const guard = (event: Event) => {
    preventedByComponent = event.defaultPrevented;
    event.preventDefault();
  };
  document.addEventListener('click', guard);
  fireEvent.click(el, { bubbles: true, cancelable: true, ...init });
  document.removeEventListener('click', guard);
  return preventedByComponent;
}

beforeEach(() => {
  scrollIntoView.mockClear();
  window.history.replaceState({}, '', '/');
});

describe('SectionNav — 링크는 진짜 링크다', () => {
  it('[AC-18.1] 모든 목차 항목이 로케일에 맞는 실제 href를 갖는다', () => {
    // 크롤러와 "새 탭으로 열기"가 성립하려면 href가 실재해야 한다
    renderNav('ko');
    for (const section of SECTIONS) {
      expect(sectionLink('ko', section.id)).toHaveAttribute('href', sectionPath('ko', section.id));
    }
  });

  it('[AC-18.2] 영어에서는 /en 접두사가 붙은 href를 만든다', () => {
    renderNav('en', '/en');
    for (const section of SECTIONS) {
      expect(sectionLink('en', section.id)).toHaveAttribute('href', sectionPath('en', section.id));
    }
  });
});

describe('SectionNav — 클릭 처리', () => {
  it('[AC-18.3] 평범한 클릭은 기본 동작을 막고 pushState로 URL만 갱신한다', () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    renderNav('ko');

    const prevented = clickAndReportPrevented(sectionLink('ko', 'career'));

    expect(prevented).toBe(true);
    // 같은 정적 페이지의 쿼리만 바뀌므로 RSC 왕복이 없어야 한다
    expect(pushState).toHaveBeenCalledWith(null, '', sectionPath('ko', 'career'));
    pushState.mockRestore();
  });

  it('[AC-18.4] 수식키 클릭은 기본 동작을 보존한다 (새 탭으로 열기)', () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    renderNav('ko');

    for (const modifier of [
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
    ]) {
      const prevented = clickAndReportPrevented(sectionLink('ko', 'career'), modifier);
      expect(prevented).toBe(false);
    }

    expect(pushState).not.toHaveBeenCalled();
    pushState.mockRestore();
  });

  it('[AC-18.5] 이동 후 포커스가 대상 섹션으로 옮겨간다', () => {
    renderNav('ko');

    clickAndReportPrevented(sectionLink('ko', 'career'));

    // 해시 링크가 하던 포커스 이동을 대신한다 — 없으면 키보드 사용자가 목차에 갇힌다
    const target = document.getElementById('career');
    expect(target).toHaveAttribute('tabindex', '-1');
    expect(target).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalled();
  });
});

describe('SectionNav — URL과의 동기화', () => {
  it('[AC-18.6] ?tab이 섹션을 가리키면 진입 시 그 섹션으로 이동한다', () => {
    renderNav('ko', sectionPath('ko', 'career'));
    expect(document.getElementById('career')).toHaveFocus();
  });

  it('[AC-18.7] ?tab=chat은 섹션이 아니므로 이동하지 않는다', () => {
    // chat은 예약어다 — 섹션으로 오인하면 챗 탭 진입 때마다 본문이 튄다
    renderNav('ko', '/?tab=chat');
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

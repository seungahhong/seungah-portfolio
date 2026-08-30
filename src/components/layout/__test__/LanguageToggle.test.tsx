'use client';
// LanguageToggle은 'use client' 모듈이다 — arch-guard R2 대응(vitest에서는 no-op).

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageToggle } from '../LanguageToggle';
import { I18nProvider } from '@/lib/i18n/provider';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/** API 경계: mock · ② 모듈 double(next/navigation). 네트워크 호출 없음. */
const nav = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }));

function renderToggle(locale: Locale, pathname: string) {
  nav.pathname = pathname;
  render(
    <I18nProvider locale={locale}>
      <LanguageToggle />
    </I18nProvider>
  );
  return screen.getByRole('link', { name: t(locale, 'lang.switchTo') });
}

describe('LanguageToggle — 상태 토글이 아니라 링크다', () => {
  it('[AC-19.1] 버튼이 아니라 href를 가진 링크로 렌더된다', () => {
    // 크롤러가 두 언어 버전의 관계를 따라갈 수 있어야 하고, 주소를 그대로 공유할 수 있어야 한다
    const link = renderToggle('ko', '/');
    expect(link).toHaveAttribute('href');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('[AC-19.2] 한국어 상세 페이지에서 같은 문서의 영어 URL을 가리킨다', () => {
    // 기대 경로는 리터럴로 적는다 — localizedPath로 만들면 동어반복이 된다
    expect(renderToggle('ko', '/career/wadiz')).toHaveAttribute('href', '/en/career/wadiz');
  });

  it('[AC-19.3] 영어에서 되돌아오면 접두사 없는 원래 경로가 된다', () => {
    expect(renderToggle('en', '/en/career/wadiz')).toHaveAttribute('href', '/career/wadiz');
  });

  it('[AC-19.4] 홈에서도 왕복이 성립한다', () => {
    expect(renderToggle('ko', '/')).toHaveAttribute('href', '/en');
  });

  it('[AC-19.5] 영어 홈에서 한국어 홈으로 돌아온다', () => {
    expect(renderToggle('en', '/en')).toHaveAttribute('href', '/');
  });
});

describe('LanguageToggle — 언어 메타데이터', () => {
  it('[AC-19.6] hrefLang과 lang이 대상 언어를 가리킨다', () => {
    // 지금 언어가 아니라 "이 링크를 따라가면 나오는 언어"여야 한다
    const link = renderToggle('ko', '/');
    expect(link).toHaveAttribute('hreflang', 'en');
    expect(link).toHaveAttribute('lang', 'en');
  });

  it('[AC-19.7] 영어 화면에서는 반대로 ko를 가리킨다', () => {
    const link = renderToggle('en', '/en');
    expect(link).toHaveAttribute('hreflang', 'ko');
    expect(link).toHaveAttribute('lang', 'ko');
  });
});

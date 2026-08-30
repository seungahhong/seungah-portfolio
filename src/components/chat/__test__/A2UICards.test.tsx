'use client';
// A2UICards는 'use client' 모듈이다 — arch-guard R2 대응(vitest에서는 no-op).

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { A2UICards } from '../A2UICards';
import { I18nProvider } from '@/lib/i18n/provider';
import { careers, profileData } from '@/helpers';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/** API 경계: 네트워크 호출 없음. 카드는 정적 데이터·i18n만 읽는다. */

function renderCards(userMessage: string, locale: Locale = 'ko') {
  return render(
    <I18nProvider locale={locale}>
      <A2UICards userMessage={userMessage} />
    </I18nProvider>
  );
}

describe('A2UICards — 질문에 맞는 카드를 붙인다', () => {
  it('[AC-24.1] 경력 키워드에는 회사 카드가 붙는다', () => {
    renderCards('와디즈에서 무슨 일을 했나요?');
    for (const career of careers) {
      expect(
        screen.getByText(t('ko', `career.companies.${career.slug}.title`))
      ).toBeInTheDocument();
    }
  });

  it('[AC-24.2] 프로필 키워드에는 프로필 카드가 붙는다', () => {
    renderCards('본인 소개를 부탁해요');
    expect(screen.getByRole('link', { name: profileData.email })).toHaveAttribute(
      'href',
      `mailto:${profileData.email}`
    );
  });

  it('[AC-24.3] 걸리는 키워드가 없으면 아무것도 렌더하지 않는다', () => {
    // 카드가 헛나오면 답변과 무관한 정보가 대화에 끼어든다
    const { container } = renderCards('오늘 날씨가 어떤가요?');
    expect(container).toBeEmptyDOMElement();
  });

  it('[AC-24.4] 빈 메시지에도 카드를 붙이지 않는다', () => {
    const { container } = renderCards('');
    expect(container).toBeEmptyDOMElement();
  });
});

describe('A2UICards — 로케일', () => {
  it('[AC-24.5] 영어 화면의 경력 카드는 영어 문구와 /en 상세 링크를 쓴다', () => {
    renderCards('tell me about your career', 'en');

    expect(
      screen.getByText(t('en', `career.companies.${careers[0].slug}.title`))
    ).toBeInTheDocument();
    // 영어 화면에서 한국어 상세 페이지로 보내면 로케일 라우팅이 무너진다
    const detailLinks = screen.getAllByRole('link', {
      name: new RegExp(t('en', 'career.details')),
    });
    expect(detailLinks).toHaveLength(careers.length);
    expect(detailLinks.map((link) => link.getAttribute('href'))).toEqual(
      careers.map((career) => `/en/career/${career.slug}`)
    );
  });
});

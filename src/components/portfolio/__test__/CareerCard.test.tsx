import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CareerCard from '../CareerCard';
import { careers } from '@/helpers';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/** API 경계: 네트워크 호출 없음. 서버 컴포넌트이며 데이터·i18n만 읽는다. */

/** 항목이 가장 많은 회사를 고른다 — "나머지 N개" 경로가 실제로 도는 카드여야 한다 */
const career = [...careers].sort((a, b) => b.items.length - a.items.length)[0];

const renderCard = (locale: Locale = 'ko') =>
  render(<CareerCard career={career} locale={locale} />);

describe('CareerCard — 미리보기와 상세로의 연결', () => {
  it('[AC-27.1] 대표 항목은 네 개까지만 보여준다', () => {
    renderCard();
    const previewed = career.items.filter((item) =>
      screen.queryByRole('link', {
        name: t('ko', `career.companies.${career.slug}.items.${item.id}.title`),
      })
    );
    expect(previewed.length).toBeLessThanOrEqual(4);
  });

  it('[AC-27.2] 남은 항목 수를 실제 개수대로 안내한다', () => {
    renderCard();
    const remaining = career.items.length - 4;
    expect(
      screen.getByText(t('ko', 'career.more', { count: remaining }))
    ).toBeInTheDocument();
  });

  it('[AC-27.3] 각 대표 항목이 상세 페이지의 해시 앵커로 연결된다', () => {
    // 이 해시는 외부에서 링크되는 주소다(/career/wadiz#msw) — 형식이 바뀌면 외부 링크가 깨진다
    renderCard();
    for (const item of career.items.slice(0, 4)) {
      expect(
        screen.getByRole('link', {
          name: t('ko', `career.companies.${career.slug}.items.${item.id}.title`),
        })
      ).toHaveAttribute('href', `/career/${career.slug}#${item.id}`);
    }
  });

  it('[AC-27.4] 영어 화면에서는 상세 링크에 /en 접두사가 붙는다', () => {
    renderCard('en');
    const detailLinks = screen.getAllByRole('link', {
      name: new RegExp(t('en', 'career.details')),
    });
    expect(detailLinks[0]).toHaveAttribute('href', `/en/career/${career.slug}`);
  });
});

describe('CareerCard — 기술 스택', () => {
  it('[AC-27.5] 카드에는 기술 스택을 여덟 개까지만 싣는다', () => {
    renderCard();
    for (const tech of career.techStack.slice(0, 8)) {
      expect(screen.getByText(tech)).toBeInTheDocument();
    }
    const overflow = career.techStack.slice(8);
    for (const tech of overflow) {
      expect(screen.queryByText(tech)).not.toBeInTheDocument();
    }
  });
});

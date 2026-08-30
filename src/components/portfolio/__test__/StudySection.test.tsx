import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StudySection from '../StudySection';
import { studyGroups } from '@/helpers';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/** API 경계: 네트워크 호출 없음. 서버 컴포넌트이며 데이터·i18n만 읽는다. */

/** 기대 URL은 리터럴로 적는다 — blogPostUrl로 만들면 동어반복이 된다 */
const BLOG_ORIGIN = 'https://seungahhong.github.io';

const renderStudy = (locale: Locale = 'ko') => render(<StudySection locale={locale} />);

const linkFor = (locale: Locale, groupId: string, linkId: string) =>
  screen.getByRole('link', { name: t(locale, `study.groups.${groupId}.links.${linkId}`) });

describe('StudySection — 블로그 링크는 화면 언어를 따라간다', () => {
  it('[AC-28.1] 한국어 화면의 링크는 한국어 글을 가리킨다', () => {
    renderStudy('ko');
    for (const group of studyGroups) {
      for (const link of group.links) {
        expect(linkFor('ko', group.id, link.id)).toHaveAttribute(
          'href',
          `${BLOG_ORIGIN}/ko/posts/${link.blogSlug}/`
        );
      }
    }
  });

  it('[AC-28.2] 영어 화면의 링크는 영어 글을 가리킨다', () => {
    // 데이터에 절대 URL을 넣으면 이 단정이 깨진다 — 영어 독자가 한국어 글로 떨어진다
    renderStudy('en');
    for (const group of studyGroups) {
      for (const link of group.links) {
        expect(linkFor('en', group.id, link.id)).toHaveAttribute(
          'href',
          `${BLOG_ORIGIN}/en/posts/${link.blogSlug}/`
        );
      }
    }
  });

  it('[AC-28.3] 블로그 홈 링크도 화면 언어를 따라간다', () => {
    renderStudy('en');
    expect(screen.getByRole('link', { name: t('en', 'study.visitBlog') })).toHaveAttribute(
      'href',
      `${BLOG_ORIGIN}/en/`
    );
  });
});

describe('StudySection — 주제군', () => {
  it('[AC-28.4] 각 주제군이 자기 링크 개수를 표기한다', () => {
    // 수치를 손으로 적으면 링크를 추가할 때 조용히 어긋난다
    const { container } = renderStudy('ko');
    for (const group of studyGroups) {
      const card = container.querySelector(`#study-${group.id}`);
      expect(card).not.toBeNull();
      expect(card!.textContent).toContain(String(group.links.length));
    }
  });

  it('[AC-28.5] stagger 클래스가 실재하는 1~6 범위 안에 있다', () => {
    // 주제군은 계속 늘어난다 — clamp가 빠지면 7번째 카드부터 조용히 보이지 않는다
    const { container } = renderStudy('ko');
    for (const group of studyGroups) {
      const card = container.querySelector(`#study-${group.id}`)!;
      const stagger = [...card.classList].find((name) => name.startsWith('stagger-'));
      expect(stagger).toBeDefined();
      const index = Number(stagger!.replace('stagger-', ''));
      expect(index).toBeGreaterThanOrEqual(1);
      expect(index).toBeLessThanOrEqual(6);
    }
  });
});

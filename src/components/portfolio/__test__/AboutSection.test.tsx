import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutSection from '../AboutSection';
import { blogStats, careers, experienceYears, profileData } from '@/helpers';
import { t, tList } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/** API 경계: 네트워크 호출 없음. 서버 컴포넌트이며 데이터·i18n만 읽는다. */

const renderAbout = (locale: Locale = 'ko') => render(<AboutSection locale={locale} />);

describe('AboutSection — 인용 가능한 수치 (GEO)', () => {
  it('[AC-30.1] 상단 통계가 데이터에서 계산된 값과 일치한다', () => {
    // 이 수치는 화면·JSON-LD·llms.txt·챗 프롬프트가 공유한다.
    // 하나라도 손으로 적으면 네 출력이 어긋나고 구조화 데이터 불일치가 SEO에 역효과를 낸다.
    renderAbout();
    const values = screen.getAllByRole('definition').map((dd) => dd.textContent);

    expect(values).toEqual([
      `${experienceYears}${t('ko', 'about.stats.yearsUnit')}`,
      String(careers.length),
      String(blogStats.articles),
    ]);
  });

  it('[AC-30.2] 시각 순서와 무관하게 마크업은 dt(항목명) → dd(값) 순서를 지킨다', () => {
    // 화면에서는 수치가 먼저 보이지만 그건 CSS order다. 접근성 트리는 마크업 순서를 읽는다.
    const { container } = renderAbout();
    for (const group of container.querySelectorAll('dl > div')) {
      const term = group.querySelector('dt')!;
      const definition = group.querySelector('dd')!;
      expect(term.compareDocumentPosition(definition) & Node.DOCUMENT_POSITION_FOLLOWING).
        toBeTruthy();
    }
  });
});

describe('AboutSection — 문서 구조', () => {
  it('[AC-30.3] 페이지의 h1은 하나이고 이름이다', () => {
    renderAbout();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(t('ko', 'profile.name'));
  });

  it('[AC-30.4] 모든 스킬 그룹이 라벨과 항목을 함께 렌더한다', () => {
    renderAbout();
    for (const groupKey of profileData.skillGroupKeys) {
      expect(
        screen.getByRole('heading', { name: t('ko', `about.skillGroups.${groupKey}.label`) })
      ).toBeInTheDocument();
      for (const skill of tList('ko', `about.skillGroups.${groupKey}.items`)) {
        expect(screen.getAllByText(skill).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('AboutSection — 연락 링크', () => {
  it('[AC-30.5] 이메일은 mailto로, 블로그는 화면 언어로 연결된다', () => {
    renderAbout('en');
    expect(screen.getByRole('link', { name: profileData.email })).toHaveAttribute(
      'href',
      `mailto:${profileData.email}`
    );
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'href',
      'https://seungahhong.github.io/en/'
    );
  });

  it('[AC-30.6] 외부 링크만 새 탭으로 열리고 mailto는 그대로 둔다', () => {
    renderAbout();
    const mailto = screen.getByRole('link', { name: profileData.email });
    expect(mailto).not.toHaveAttribute('target');

    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

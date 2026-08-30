import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProjectSection from '../ProjectSection';
import { personalProjects, presentations } from '@/helpers';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/** API 경계: 네트워크 호출 없음. 서버 컴포넌트이며 데이터·i18n만 읽는다. */

/** 기대 URL은 리터럴로 적는다 — blogHomeUrl로 만들면 동어반복이 된다 */
const BLOG_ORIGIN = 'https://seungahhong.github.io';

const renderProjects = (locale: Locale = 'ko') => render(<ProjectSection locale={locale} />);

/** next/image가 src를 /_next/image?url=... 로 감싸므로 원본 경로로 되돌려 본다 */
const originalSrc = (img: HTMLImageElement) => decodeURIComponent(img.getAttribute('src') ?? '');

describe('ProjectSection — 로케일에 맞춘 외부 연결', () => {
  it('[AC-29.1] 블로그 프로젝트는 화면 언어의 블로그 홈으로 간다', () => {
    const blogProject = personalProjects.find((project) => project.localizedUrl === 'blog')!;
    const { container } = renderProjects('en');

    const card = container.querySelector(`#project-${blogProject.key}`)!;
    const visit = [...card.querySelectorAll('a')].find(
      (a) => a.textContent?.includes(t('en', 'projects.visit'))
    )!;
    expect(visit).toHaveAttribute('href', `${BLOG_ORIGIN}/en/`);
  });

  it('[AC-29.2] 로케일 이미지가 있으면 그 언어의 이미지를 쓴다', () => {
    const localized = personalProjects.find((project) => project.localizedImage)!;
    const { container } = renderProjects('en');

    const image = container.querySelector<HTMLImageElement>(`#project-${localized.key} img`)!;
    expect(originalSrc(image)).toContain(localized.localizedImage!.en);
  });

  it('[AC-29.3] 로케일 이미지가 없으면 기본 이미지로 떨어진다', () => {
    const plain = personalProjects.find((project) => !project.localizedImage && project.image)!;
    const { container } = renderProjects('en');

    const image = container.querySelector<HTMLImageElement>(`#project-${plain.key} img`)!;
    expect(originalSrc(image)).toContain(plain.image!);
  });

  it('[AC-29.4] 발표·기고의 아티클 링크도 화면 언어를 따라간다', () => {
    const withLinks = presentations.find((item) => item.links)!;
    const { container } = renderProjects('en');

    const card = container.querySelector(`#project-${withLinks.key}`)!;
    for (const link of withLinks.links!) {
      const anchor = [...card.querySelectorAll('a')].find(
        (a) => a.getAttribute('href') === `${BLOG_ORIGIN}/en/posts/${link.blogSlug}/`
      );
      expect(anchor, `링크 ${link.id}가 영어 글을 가리키지 않는다`).toBeDefined();
    }
  });
});

describe('ProjectSection — 외부 링크 안전성', () => {
  it('[AC-29.5] 새 탭으로 여는 링크는 모두 rel 안전 속성을 갖는다', () => {
    const { container } = renderProjects('ko');
    const external = [...container.querySelectorAll('a[target="_blank"]')];

    expect(external.length).toBeGreaterThan(0);
    for (const anchor of external) {
      expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});

describe('ProjectSection — 애니메이션 클래스', () => {
  it('[AC-29.6] stagger 클래스가 실재하는 1~6 범위 안에 있다', () => {
    // 인덱스를 clamp하지 않으므로 항목이 다섯 개를 넘기는 순간 stagger-7이 만들어진다
    const { container } = renderProjects('ko');
    const cards = [...personalProjects, ...presentations].map(
      (item) => container.querySelector(`#project-${item.key}`)!
    );

    for (const card of cards) {
      const stagger = [...card.classList].find((name) => name.startsWith('stagger-'));
      expect(stagger).toBeDefined();
      const index = Number(stagger!.replace('stagger-', ''));
      expect(index).toBeGreaterThanOrEqual(1);
      expect(index).toBeLessThanOrEqual(6);
    }
  });
});

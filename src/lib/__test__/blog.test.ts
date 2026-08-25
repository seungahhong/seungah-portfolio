import { describe, it, expect } from 'vitest';
import { blogHomeUrl, blogPostUrl } from '../blog';
import { LOCALES } from '../i18n/constants';

const SLUG = 'react-19-migration';

describe('blogPostUrl', () => {
  it('[AC-10.1] 로케일별로 해당 언어의 글 경로를 만든다', () => {
    for (const locale of LOCALES) {
      expect(new URL(blogPostUrl(locale, SLUG)).pathname).toBe(`/${locale}/posts/${SLUG}/`);
    }
  });

  // 이 함수의 존재 이유 — 데이터에 절대 URL을 넣으면 영어 페이지가 한국어 글로 보낸다.
  it('[AC-10.2] 영어 링크가 한국어 글을 가리키지 않는다', () => {
    const en = blogPostUrl('en', SLUG);
    expect(en).toContain('/en/');
    expect(en).not.toContain('/ko/');
  });

  // 오리진을 하드코딩하지 않고 불변식으로 검증한다 — 도메인이 바뀌어도 이 단정은 유효하다.
  it('[AC-10.3] 로케일이 달라도 같은 오리진을 쓴다', () => {
    const origins = LOCALES.map(locale => new URL(blogPostUrl(locale, SLUG)).origin);
    expect(new Set(origins).size).toBe(1);
  });

  it('[AC-10.4] slug를 변형하지 않는다', () => {
    const slug = 'next-js-13-to-15';
    expect(new URL(blogPostUrl('ko', slug)).pathname).toContain(slug);
  });
});

describe('blogHomeUrl', () => {
  it('[AC-10.5] 기본 로케일은 ko다', () => {
    expect(blogHomeUrl()).toBe(blogHomeUrl('ko'));
  });

  it('[AC-10.6] 로케일별 홈 경로를 만든다', () => {
    for (const locale of LOCALES) {
      expect(new URL(blogHomeUrl(locale)).pathname).toBe(`/${locale}/`);
    }
  });
});

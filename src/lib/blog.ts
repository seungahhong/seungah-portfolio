import type { Locale } from '@/lib/i18n/constants';

/**
 * 기술블로그 링크 생성.
 *
 * 블로그는 한/영 1:1 이중 언어로 운영되므로(`/ko/posts/...`, `/en/posts/...`),
 * 화면 로케일에 맞는 글로 연결한다. slug는 양쪽이 동일하다.
 */
const BLOG_ORIGIN = 'https://seungahhong.github.io';

export function blogHomeUrl(locale: Locale = 'ko'): string {
  return `${BLOG_ORIGIN}/${locale}/`;
}

export function blogPostUrl(locale: Locale, slug: string): string {
  return `${BLOG_ORIGIN}/${locale}/posts/${slug}/`;
}

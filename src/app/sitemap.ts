import type { MetadataRoute } from 'next';
import { careerSlugs } from '@/helpers';
import { absoluteUrl, localizedUrl } from '@/lib/seo';
import { localizedPath, LOCALES } from '@/lib/i18n/constants';

/**
 * 사이트맵 — 한국어(`/`)와 영어(`/en`) 두 언어 버전을 모두 싣고,
 * 각 항목에 hreflang 대체 링크를 붙여 검색엔진이 같은 문서의 언어 쌍임을 알 수 있게 한다.
 */
function languagesFor(path: string) {
  return {
    'ko-KR': absoluteUrl(localizedPath('ko', path)),
    'en-US': absoluteUrl(localizedPath('en', path)),
    'x-default': absoluteUrl(localizedPath('ko', path)),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = ['/', ...careerSlugs.map((slug) => `/career/${slug}`)];

  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified,
      changeFrequency: (path === '/' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: path === '/' ? 1 : 0.8,
      alternates: { languages: languagesFor(path) },
    }))
  );
}

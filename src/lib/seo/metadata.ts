import type { Metadata, Viewport } from 'next';
import { getCareerDetail, profileData } from '@/helpers';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';
import {
  KEYWORDS,
  OG_IMAGE,
  OG_LOCALES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  SITE_VERIFICATION,
  alternatesFor,
  localizedUrl,
} from './config';

/** 로케일별 루트 메타데이터 — hreflang으로 두 언어 버전을 서로 연결한다 */
export function buildRootMetadata(locale: Locale): Metadata {
  const other: Locale = locale === 'ko' ? 'en' : 'ko';

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_TITLE[locale],
      template: `%s | ${SITE_NAME[locale]}`,
    },
    description: SITE_DESCRIPTION[locale],
    keywords: [...KEYWORDS[locale]],
    applicationName: SITE_NAME[locale],
    authors: [{ name: t(locale, 'profile.name'), url: profileData.github }],
    creator: t(locale, 'profile.name'),
    publisher: t(locale, 'profile.name'),
    category: 'technology',
    alternates: alternatesFor(locale, '/'),
    openGraph: {
      type: 'profile',
      url: localizedUrl(locale, '/'),
      siteName: SITE_NAME[locale],
      title: SITE_TITLE[locale],
      description: SITE_DESCRIPTION[locale],
      locale: OG_LOCALES[locale],
      alternateLocale: [OG_LOCALES[other]],
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_TITLE[locale],
      description: SITE_DESCRIPTION[locale],
      images: [OG_IMAGE.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    formatDetection: { email: false, telephone: false },
    /**
     * 검색 콘솔 소유권 확인.
     *
     * 네이버는 Metadata API에 전용 키가 없어 `other`로 임의 이름의 메타를 직접 내보낸다
     * (`<meta name="naver-site-verification" ...>`). 토큰이 비면 그 태그만 빠진다.
     */
    verification: {
      ...(SITE_VERIFICATION.google.length ? { google: SITE_VERIFICATION.google } : {}),
      ...(SITE_VERIFICATION.naver
        ? { other: { 'naver-site-verification': SITE_VERIFICATION.naver } }
        : {}),
    },
  };
}

export const rootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfd' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

/** 경력 상세 페이지 메타데이터 (양쪽 로케일 공용) */
export function buildCareerMetadata(locale: Locale, slug: string): Metadata {
  const career = getCareerDetail(slug);
  if (!career) return {};

  const base = `career.companies.${slug}`;
  const name = t(locale, `${base}.title`);
  const summary = t(locale, `${base}.summary`);
  const title = `${name} — ${career.period}`;
  const path = `/career/${slug}`;

  return {
    title,
    description: summary,
    keywords: [name, career.legalName, ...career.techStack.slice(0, 10)],
    alternates: alternatesFor(locale, path),
    openGraph: {
      type: 'article',
      url: localizedUrl(locale, path),
      siteName: SITE_NAME[locale],
      locale: OG_LOCALES[locale],
      title,
      description: summary,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: summary,
      images: [OG_IMAGE.url],
    },
  };
}

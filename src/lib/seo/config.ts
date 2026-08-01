import { blogStats, experienceYears } from '@/helpers';
import { t } from '@/lib/i18n/t';
import { localizedPath, type Locale } from '@/lib/i18n/constants';

/**
 * 사이트 전역 SEO/GEO 설정.
 *
 * 정규 URL은 배포 환경에 따라 달라질 수 있으므로 `NEXT_PUBLIC_SITE_URL`로 덮어쓸 수 있게 한다.
 * 값이 없으면 이력서에 표기된 공개 주소를 사용한다.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://seungah-portfolio.vercel.app'
).replace(/\/$/, '');

/**
 * 검색 콘솔 소유권 확인 토큰.
 *
 * Gatsby 시절 `<meta>`로 심어 두었던 값이며, 이 태그가 사라지면 확인이 풀려
 * 서치 콘솔의 색인 요청·사이트맵 제출이 실패한다. **삭제 금지.**
 *
 * 두 로케일 루트 레이아웃 메타데이터를 통해 모든 페이지에 함께 나간다.
 * 환경변수로 덮어쓸 수 있게 둔 것은 다른 도메인에 미리보기 배포할 때를 위한 것이고,
 * 값을 비우면 해당 태그만 생략된다.
 */
export const SITE_VERIFICATION = {
  google:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
    'DafIPWtLpIjdEIuERhMFfutDl2IoaF8b6CQTBYF6qsQ',
  naver:
    process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ??
    'ab246841529a97bcf76ac7ed42d5a5c457a381bc',
} as const;

export const SITE_NAME = {
  ko: '홍승아 포트폴리오',
  en: 'Seungah Hong Portfolio',
} as const;

export const SITE_TITLE = {
  ko: '홍승아 포트폴리오 | 프론트엔드 개발자 Seungah Hong',
  en: 'Seungah Hong Portfolio | Frontend Developer',
} as const;

/**
 * 메타 설명 — GEO 원칙에 따라 구체 수치(연차·아티클 수)를 포함한다.
 * 검색 결과 잘림을 피하기 위해 150~160자 범위를 유지한다.
 */
export const SITE_DESCRIPTION = {
  ko:
    `${experienceYears}년차 프론트엔드 개발자 홍승아의 포트폴리오입니다. ` +
    `React·TypeScript·Next.js 기반으로 커머스 서비스의 레거시 현대화, 글로벌 전환, ` +
    `클라우드 이전, AI 개발 워크플로 구축을 담당했고 기술 아티클 ${blogStats.articles}편을 공개하고 있습니다.`,
  en:
    `Portfolio of Seungah Hong, a frontend developer with ${experienceYears} years of experience. ` +
    `React, TypeScript and Next.js, with hands-on ownership of legacy modernization, global expansion, ` +
    `cloud migration and AI development workflows, plus ${blogStats.articles} published technical articles.`,
} as const;

export const KEYWORDS = {
  ko: [
    '홍승아', 'Seungah Hong', '프론트엔드 개발자', 'Frontend Developer', '포트폴리오',
    'React', 'Next.js', 'TypeScript', '와디즈', 'Wadiz',
    '테스트 자동화', 'Playwright', 'AI 워크플로', 'Claude Code', 'RAG',
  ],
  en: [
    'Seungah Hong', '홍승아', 'Frontend Developer', 'Portfolio', 'Resume',
    'React', 'Next.js', 'TypeScript', 'Wadiz',
    'Test Automation', 'Playwright', 'AI Workflow', 'Claude Code', 'RAG',
  ],
} as const;

export const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${t('ko', 'profile.name')} (${t('en', 'profile.name')}) — ${t('ko', 'profile.role')}`,
} as const;

export const OG_LOCALES = { ko: 'ko_KR', en: 'en_US' } as const;
export const HTML_LANG = { ko: 'ko-KR', en: 'en-US' } as const;

/** 절대 URL 생성 — canonical / JSON-LD / 사이트맵이 같은 규칙을 공유한다 */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** 로케일별 절대 URL — `/career/wadiz` → `https://.../en/career/wadiz` */
export function localizedUrl(locale: Locale, path = '/'): string {
  return absoluteUrl(localizedPath(locale, path));
}

/**
 * hreflang 대체 링크.
 *
 * 언어별로 별도 URL이 있어야 성립하는 신호이므로, 로케일 접두사 라우트를 도입한 뒤에만 의미가 있다.
 * `x-default`는 기본 로케일(한국어) 경로를 가리킨다.
 */
export function alternatesFor(locale: Locale, path = '/') {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      'ko-KR': localizedPath('ko', path),
      'en-US': localizedPath('en', path),
      'x-default': localizedPath('ko', path),
    },
  };
}

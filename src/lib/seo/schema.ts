import {
  careers,
  faqIds,
  faqParams,
  personalProjects,
  profileData,
  profileSameAs,
  presentations,
} from '@/helpers';
import type { ICareerDetail } from '@/types';
import { t, tList } from '@/lib/i18n/t';
import { SITE_NAME, SITE_DESCRIPTION, HTML_LANG, absoluteUrl, localizedUrl } from './config';
import { sectionPath } from '@/lib/sections';
import type { Locale } from '@/lib/i18n/constants';

type Schema = Record<string, unknown>;

/** 언어 버전마다 별도 문서이므로 엔티티 @id도 로케일별로 분리한다 */
const personId = (locale: Locale) => `${localizedUrl(locale, '/')}#person`;
const websiteId = (locale: Locale) => `${localizedUrl(locale, '/')}#website`;

/**
 * Person 스키마.
 * `@id`를 고정해 다른 스키마(ProfilePage·BreadcrumbList 등)에서 동일 엔티티로 참조한다.
 */
export function buildPersonSchema(locale: Locale = 'ko'): Schema {
  const isKo = locale === 'ko';

  return {
    '@type': 'Person',
    '@id': personId(locale),
    name: t(locale, 'profile.name'),
    alternateName: t(locale, 'profile.nameAlt'),
    jobTitle: t(locale, 'profile.role'),
    description: t(locale, 'profile.headline'),
    email: `mailto:${profileData.email}`,
    url: localizedUrl(locale, '/'),
    image: absoluteUrl('/profile_logo.webp'),
    address: {
      '@type': 'PostalAddress',
      addressLocality: t(locale, 'profile.location'),
      addressCountry: 'KR',
    },
    sameAs: profileSameAs,
    knowsAbout: profileData.knowsAbout,
    knowsLanguage: ['ko', 'en'],
    // 재직 이력은 schema.org Role 패턴으로 표현한다 —
    // 관계 속성(worksFor/alumniOf)을 Role로 감싸고 그 안에서 같은 속성을 다시 지정한다.
    worksFor: careers
      .filter((company) => !company.endDate)
      .map((company) => buildOrganizationRole(company, 'worksFor', locale)),
    alumniOf: careers
      .filter((company) => !!company.endDate)
      .map((company) => buildOrganizationRole(company, 'alumniOf', locale)),
    hasOccupation: {
      '@type': 'Occupation',
      name: t(locale, 'profile.role'),
      occupationLocation: { '@type': 'Country', name: isKo ? '대한민국' : 'South Korea' },
      skills: allTechStack().join(', '),
    },
  };
}

function allTechStack(): string[] {
  return Array.from(new Set(careers.flatMap((company) => company.techStack)));
}

export function buildOrganizationSchema(company: ICareerDetail, locale: Locale = 'ko'): Schema {
  return {
    '@type': 'Organization',
    name: company.legalName,
    alternateName: t(locale, `career.companies.${company.slug}.title`),
    ...(company.companyUrl ? { url: company.companyUrl } : {}),
  };
}

/** Role 패턴 — 재직 기간과 직무명을 조직 관계에 덧붙인다 */
function buildOrganizationRole(
  company: ICareerDetail,
  relation: 'worksFor' | 'alumniOf',
  locale: Locale
): Schema {
  return {
    '@type': 'OrganizationRole',
    // 회사마다 직무가 다르므로(임베디드·윈도우 앱 등) 대표 직함 대신 회사별 역할을 쓴다
    roleName: t(locale, `career.companies.${company.slug}.role`),
    startDate: company.startDate,
    ...(company.endDate ? { endDate: company.endDate } : {}),
    url: localizedUrl(locale, `/career/${company.slug}`),
    [relation]: buildOrganizationSchema(company, locale),
  };
}

export function buildWebSiteSchema(locale: Locale = 'ko'): Schema {
  return {
    '@type': 'WebSite',
    '@id': websiteId(locale),
    url: localizedUrl(locale, '/'),
    name: locale === 'ko' ? SITE_NAME.ko : SITE_NAME.en,
    description: SITE_DESCRIPTION[locale],
    inLanguage: ['ko-KR', 'en-US'],
    author: { '@id': personId(locale) },
    publisher: { '@id': personId(locale) },
  };
}

/** 인물 소개가 주제인 페이지에는 WebPage 대신 ProfilePage를 사용한다 */
export function buildProfilePageSchema(locale: Locale = 'ko'): Schema {
  return {
    '@type': 'ProfilePage',
    '@id': `${localizedUrl(locale, '/')}#profilepage`,
    url: localizedUrl(locale, '/'),
    name: locale === 'ko' ? SITE_NAME.ko : SITE_NAME.en,
    isPartOf: { '@id': websiteId(locale) },
    about: { '@id': personId(locale) },
    mainEntity: { '@id': personId(locale) },
    inLanguage: HTML_LANG[locale],
  };
}

/**
 * FAQPage 스키마.
 * AI 검색엔진이 답변을 인용할 때 가장 많이 참조하는 구조라 별도 엔티티로 노출한다.
 * 화면(FaqSection)과 같은 i18n·수치를 사용하므로 내용이 어긋날 수 없다.
 */
export function buildFaqSchema(locale: Locale = 'ko'): Schema {
  const params = faqParams();

  return {
    '@type': 'FAQPage',
    '@id': `${localizedUrl(locale, '/')}#faq`,
    inLanguage: HTML_LANG[locale],
    mainEntity: faqIds.map((id) => ({
      '@type': 'Question',
      '@id': `${localizedUrl(locale, '/')}#faq-${id}`,
      name: t(locale, `faq.items.${id}.question`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(locale, `faq.items.${id}.answer`, params),
      },
    })),
  };
}

export function buildBreadcrumbSchema(
  locale: Locale,
  /** `url`은 섹션 링크처럼 경로만으로 조립할 수 없는 주소를 넘길 때 쓴다 */
  trail: { name: string; path: string; url?: string }[],
  pagePath: string
): Schema {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${localizedUrl(locale, pagePath)}#breadcrumb`,
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url ?? localizedUrl(locale, crumb.path),
    })),
  };
}

/** 경력 상세 페이지 — 재직 이력을 구조화 데이터로 노출한다 */
export function buildCareerPageSchema(company: ICareerDetail, locale: Locale = 'ko'): Schema {
  const base = `career.companies.${company.slug}`;
  const path = `/career/${company.slug}`;
  const pageUrl = localizedUrl(locale, path);

  return {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: `${t(locale, `${base}.title`)} — ${t(locale, 'profile.name')}`,
    description: t(locale, `${base}.summary`),
    isPartOf: { '@id': websiteId(locale) },
    inLanguage: HTML_LANG[locale],
    about: buildOrganizationSchema(company, locale),
    mainEntity: { '@id': personId(locale) },
    hasPart: company.items.map((item) => ({
      '@type': 'CreativeWork',
      '@id': `${pageUrl}#${item.id}`,
      name: t(locale, `${base}.items.${item.id}.title`),
      description: tList(locale, `${base}.items.${item.id}.points`)[0],
      author: { '@id': personId(locale) },
    })),
  };
}

/** 개인 프로젝트 / 발표·기고를 ItemList로 노출해 AI 검색이 목록을 추출하기 쉽게 만든다 */
export function buildWorkListSchema(locale: Locale = 'ko'): Schema {
  const items = [
    ...personalProjects.map((project) => ({
      '@type': 'SoftwareSourceCode' as const,
      name: t(locale, `projects.items.${project.key}.title`),
      description: t(locale, `projects.items.${project.key}.description`),
      url: project.url,
      ...(project.repo ? { codeRepository: project.repo } : {}),
      programmingLanguage: project.techStack.join(', '),
    })),
    ...presentations.map((presentation) => ({
      '@type': 'Article' as const,
      name: t(locale, `projects.items.${presentation.key}.title`),
      description: t(locale, `projects.items.${presentation.key}.description`),
      url: presentation.url,
      datePublished: presentation.publishedAt,
    })),
  ];

  return {
    '@type': 'ItemList',
    '@id': `${localizedUrl(locale, '/')}#works`,
    name: locale === 'ko' ? '개인 프로젝트 및 발표·기고' : 'Personal projects, talks and articles',
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: { ...item, author: { '@id': personId(locale) } },
    })),
  };
}

/** 여러 스키마를 하나의 `@graph`로 묶는다 — 중복 `@context` 없이 엔티티 관계를 유지한다 */
export function buildGraph(...schemas: Schema[]): Schema {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}

export function buildHomeGraph(locale: Locale = 'ko'): Schema {
  return buildGraph(
    buildWebSiteSchema(locale),
    buildProfilePageSchema(locale),
    buildPersonSchema(locale),
    buildFaqSchema(locale),
    buildWorkListSchema(locale)
  );
}

export function buildCareerGraph(company: ICareerDetail, locale: Locale = 'ko'): Schema {
  const path = `/career/${company.slug}`;

  return buildGraph(
    buildCareerPageSchema(company, locale),
    buildBreadcrumbSchema(
      locale,
      [
        { name: t(locale, 'nav.home'), path: '/' },
        // 화면의 브레드크럼 링크와 같은 주소여야 하므로 섹션 링크를 그대로 절대화한다
        { name: t(locale, 'career.title'), path: '/', url: absoluteUrl(sectionPath(locale, 'career')) },
        { name: t(locale, `career.companies.${company.slug}.title`), path },
      ],
      path
    ),
    buildPersonSchema(locale)
  );
}

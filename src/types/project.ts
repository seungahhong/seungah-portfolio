/**
 * 개인 프로젝트 / 발표·기고 / 학습 아카이브 타입.
 *
 * 표시 문구는 모두 `src/lib/i18n/{ko,en}.json`에서 관리하고,
 * 여기에는 id·URL·이미지 경로 등 언어와 무관한 값만 담는다.
 *
 * 기술블로그는 한/영 1:1로 운영되므로 절대 URL 대신 `blogSlug`를 저장하고
 * 화면 로케일에 맞는 주소를 런타임에 만든다.
 */

import type { Locale } from '@/lib/i18n/constants';

export interface IPersonalProject {
  /** i18n 키(`projects.items.{key}`) 겸 해시 앵커 id */
  key: string;
  /** 대표 이미지 경로. 로케일별 이미지가 다르면 `localizedImage`를 대신 쓴다 */
  image?: string;
  /** 기술블로그처럼 언어별 대표 이미지가 따로 있는 경우 */
  localizedImage?: Record<Locale, string>;
  /** 절대 URL. 블로그처럼 로케일별 주소가 있으면 `localizedUrl`을 대신 쓴다 */
  url?: string;
  /** 기술블로그 홈처럼 로케일별 주소가 있는 경우 */
  localizedUrl?: 'blog';
  repo?: string;
  period: string;
  techStack: string[];
  deploy: string;
}

export interface IPresentation {
  /** i18n 키(`projects.items.{key}`) 겸 해시 앵커 id */
  key: string;
  image: string;
  /** 화면 표시용 기간 문자열 */
  date: string;
  /** ISO 8601 발행일 — JSON-LD `datePublished`용 (표시 문자열은 범위일 수 있어 분리한다) */
  publishedAt: string;
  /** 대표 링크: 블로그 글이면 slug, 외부 사이트면 절대 URL */
  blogSlug?: string;
  url?: string;
  /** 시리즈물인 경우 개별 아티클 — 제목은 i18n `projects.items.{key}.links.{id}` */
  links?: { id: string; blogSlug: string }[];
}

/** Personal Study — 주제군 단위 학습 아카이브 */
export interface IStudyGroup {
  /** 해시 앵커 id 겸 i18n 키(`study.groups.{id}`) */
  id: string;
  /** 링크 제목은 i18n `study.groups.{groupId}.links.{id}`, URL은 slug + 로케일로 조립 */
  links: { id: string; blogSlug: string }[];
}

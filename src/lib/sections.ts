import { localizedPath, type Locale } from './i18n/constants';

/**
 * 홈 최상위 섹션 목록 (헤더 목차 표시 순서).
 *
 * 섹션 이동은 해시(`#about`)가 아니라 쿼리 파라미터(`?tab=about`)를 쓴다.
 * **챗 탭(`?tab=chat`)과 같은 파라미터를 공유하므로 섹션 id에 `chat`을 넣으면 안 된다** —
 * `TabContext`가 `tab=chat`만 챗으로 해석하고 나머지는 포트폴리오로 보기 때문에,
 * 섹션 id는 자동으로 포트폴리오 탭에 머문다.
 *
 * 지시어 없는 모듈에 둔다. `'use client'` 모듈에 두면 서버 컴포넌트가 import할 때
 * 값이 아니라 클라이언트 참조 프록시로 넘어와 조용히 실패한다.
 */
export const SECTIONS = [
  { id: 'about', labelKey: 'nav.about' },
  { id: 'career', labelKey: 'nav.career' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'study', labelKey: 'nav.study' },
  { id: 'faq', labelKey: 'nav.faq' },
  { id: 'contact', labelKey: 'nav.contact' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

const SECTION_IDS: readonly string[] = SECTIONS.map((section) => section.id);

export function isSectionId(value: string | null | undefined): value is SectionId {
  return !!value && SECTION_IDS.includes(value);
}

/**
 * 홈 섹션 링크. `/?tab=about`, `/en?tab=about`.
 *
 * 쿼리는 로케일 접두사 **뒤에** 붙어야 하므로 `localizedPath`에 통째로 넘기지 않는다
 * (넘기면 `/en/?tab=about`처럼 슬래시가 하나 더 붙는다).
 */
export function sectionPath(locale: Locale, id: SectionId): string {
  return `${localizedPath(locale, '/')}?tab=${id}`;
}

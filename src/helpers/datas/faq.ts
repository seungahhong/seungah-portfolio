import { blogStats, experienceYears, profileData } from './profile';
import { careers } from './career';
import { studyLinkCount } from './studies';

/**
 * 자주 묻는 질문 — 표시 순서.
 *
 * 질문·답변 문구는 `src/lib/i18n/{ko,en}.json`의 `faq.items.{id}`에 있고,
 * 답변 안의 `{years}` 같은 자리표시자는 `faqParams()`가 채운다.
 *
 * GEO(생성형 검색 최적화) 원칙:
 * - 답변 우선: 첫 문장에 결론
 * - 통계 포함: 연차·편수는 데이터에서 직접 계산해 본문·JSON-LD가 어긋나지 않게 한다
 */
export const faqIds = [
  'who',
  'experience',
  'skills',
  'wadiz',
  'test',
  'ai-workflow',
  'performance',
  'blog',
  'contact',
] as const;

export type FaqId = (typeof faqIds)[number];

/** FAQ 문구에 주입할 실측값 */
export function faqParams(): Record<string, string | number> {
  return {
    years: experienceYears,
    companies: careers.length,
    since: blogStats.since,
    articles: blogStats.articles,
    documents: blogStats.documents,
    links: studyLinkCount,
    email: profileData.email,
    github: profileData.github,
    blog: profileData.blog,
  };
}

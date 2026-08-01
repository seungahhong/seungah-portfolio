import type { IPersonalProject, IPresentation } from '../../types';

/**
 * 개인 프로젝트 / 발표·기고.
 *
 * 제목·설명·링크 표시 문구는 `src/lib/i18n/{ko,en}.json`의 `projects.items.{key}`에 있다.
 * 여기에는 이미지 경로·URL·기간·기술명처럼 언어와 무관한 값만 둔다.
 */
export const personalProjects: IPersonalProject[] = [
  {
    key: 'portfolio',
    image: '/og-portfolio.png',
    url: 'https://seungah-portfolio.vercel.app/',
    repo: 'https://github.com/seungahhong/seungah-portfolio',
    period: '2022.11 ~',
    techStack: [
      'Next.js 16',
      'React 19',
      'TypeScript 5',
      'Tailwind CSS 4',
      'Groq API',
      'Nodemailer',
    ],
    deploy: 'Vercel',
  },
  {
    key: 'blog',
    localizedImage: { ko: '/og-blog-ko.png', en: '/og-blog-en.png' },
    localizedUrl: 'blog',
    repo: 'https://github.com/seungahhong/seungahhong.github.io',
    period: '2022.11 ~',
    techStack: ['Gatsby', 'TypeScript', 'Styled-Components', 'Vitest', 'Playwright'],
    deploy: 'gh-pages',
  },
];

export const presentations: IPresentation[] = [
  {
    key: 'harness',
    image: '/study_logo.jpeg',
    date: '2026.06 ~ 2026.07',
    publishedAt: '2026-06',
    blogSlug: '2026-06-04-fe-harness',
    links: [
      { id: 'fe-harness', blogSlug: '2026-06-04-fe-harness' },
      { id: 'meta-harness', blogSlug: '2026-07-05-meta-harness' },
      { id: 'product-spec', blogSlug: '2026-07-12-product-spec-harness' },
      { id: 'rag', blogSlug: '2026-06-01-RAG' },
      { id: 'llm-wiki', blogSlug: '2026-06-02-LLM-WIKI' },
      { id: 'marketplace', blogSlug: '2026-06-03-claude-marketplace' },
    ],
  },
  {
    key: 'wadizPerf',
    image: '/wadiz-perf-cover.png',
    date: '2022.08',
    publishedAt: '2022-08',
    url: 'https://blog.wadiz.kr/%ed%8e%80%eb%94%a9%ed%95%98%ea%b8%b0-%ec%83%81%ec%84%b8-%ed%8e%98%ec%9d%b4%ec%a7%80-%ec%84%b1%eb%8a%a5-%ea%b0%9c%ec%84%a0%ed%95%98%ea%b8%b0/',
  },
  {
    key: 'patent',
    image: '/works_patent_logo.jpeg',
    date: '2020.01',
    publishedAt: '2020-01',
    url: 'http://kportal.kipris.or.kr/kportal/search/total_search.do',
  },
];

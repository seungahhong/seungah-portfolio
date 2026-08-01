import type { IStudyGroup } from '../../types';

/**
 * Personal Study — 기술블로그 아티클 아카이브.
 *
 * 여기에는 링크 id와 블로그 slug만 둔다 — 실제 URL은 화면 로케일에 맞춰 조립한다
 * (블로그가 한/영 1:1이라 영어로 보면 영문 글로 연결된다).
 * 그룹 라벨과 링크 제목은 `src/lib/i18n/{ko,en}.json`의 `study.groups.{groupId}`에서 관리한다.
 *
 * 프론트엔드 프레임워크 → 빌드/번들러 → 테스트 → AI 하네스로 이어지는
 * 학습 궤적이 드러나도록 주제군을 구성하고, 각 군은 버전 추적 순으로 정렬한다.
 */
export const studyGroups: IStudyGroup[] = [
  {
    id: 'ai-harness',
    links: [
      { id: 'rag', blogSlug: '2026-06-01-RAG' },
      { id: 'llm-wiki', blogSlug: '2026-06-02-LLM-WIKI' },
      { id: 'marketplace', blogSlug: '2026-06-03-claude-marketplace' },
      { id: 'fe-harness', blogSlug: '2026-06-04-fe-harness' },
      { id: 'meta-harness', blogSlug: '2026-07-05-meta-harness' },
      { id: 'product-spec', blogSlug: '2026-07-12-product-spec-harness' },
      { id: 'figma-mcp', blogSlug: '2025-06-28-figma-mcp-link' },
    ],
  },
  {
    id: 'react',
    links: [
      { id: 'v19', blogSlug: '2024-12-05-react-v19' },
      { id: 'v19-next', blogSlug: '2024-03-24-react-v19-next' },
      { id: 'v18', blogSlug: '2022-06-08-react18' },
      { id: 'v18-migration', blogSlug: '2024-01-27-react-v18-migration' },
      { id: 'v17', blogSlug: '2022-02-13-react17' },
      { id: 'router-v6', blogSlug: '2022-03-12-react-router-v6' },
    ],
  },
  {
    id: 'nextjs',
    links: [
      { id: 'v15-migration', blogSlug: '2024-11-23-nextjs-v15-migration' },
      { id: 'v14', blogSlug: '2023-10-30-nextjs-v14' },
      { id: 'v14-migration', blogSlug: '2024-01-20-nextjs-v14-migration' },
      { id: 'v13', blogSlug: '2023-08-27-nextjs-v13' },
    ],
  },
  {
    id: 'state',
    links: [
      { id: 'overview', blogSlug: '2023-09-10-react-state' },
      { id: 'redux', blogSlug: '2021-12-30-redux' },
      { id: 'redux-toolkit', blogSlug: '2022-03-26-redux-toolkit' },
      { id: 'redux-saga', blogSlug: '2022-03-07-redux-saga' },
      { id: 'react-query', blogSlug: '2022-12-30-react-query' },
      { id: 'react-query-v4', blogSlug: '2023-06-30-react-query-v4' },
      { id: 'react-query-v5', blogSlug: '2023-07-23-react-query-v5' },
      { id: 'recoil', blogSlug: '2022-03-22-recoil' },
      { id: 'jotai', blogSlug: '2022-06-14-jotai' },
      { id: 'zustand', blogSlug: '2023-07-22-zustand' },
      { id: 'mobx', blogSlug: '2021-12-31-mobx' },
      { id: 'swr', blogSlug: '2022-03-30-SWR' },
    ],
  },
  {
    id: 'build',
    links: [
      { id: 'vite6', blogSlug: '2025-06-29-vite6.0' },
      { id: 'vite7', blogSlug: '2025-09-07-vite7.0' },
      { id: 'vite8', blogSlug: '2026-07-13-vite8.0' },
      { id: 'cra-to-vite', blogSlug: '2024-11-16-vite' },
      { id: 'pnpm', blogSlug: '2024-03-18-pnpm' },
      { id: 'esbuild', blogSlug: '2024-04-28-esbuild' },
      { id: 'treeshaking', blogSlug: '2023-08-16-treeshaking' },
      { id: 'unused-deps', blogSlug: '2024-03-17-remove-unused-dependencies' },
      { id: 'dev-improvements', blogSlug: '2024-05-12-development-improvements' },
    ],
  },
  {
    id: 'test',
    links: [
      { id: 'playwright', blogSlug: '2023-04-02-playwright' },
      { id: 'cypress', blogSlug: '2022-08-07-cypress' },
      { id: 'jest', blogSlug: '2022-07-24-jest' },
      { id: 'storybook', blogSlug: '2022-03-19-storybook' },
      { id: 'msw', blogSlug: '2022-07-25-msw' },
    ],
  },
  {
    id: 'form',
    links: [
      { id: 'basic', blogSlug: '2022-05-30-form' },
      { id: 'rhf-v7', blogSlug: '2023-08-26-react-hook-form-v7' },
      { id: 'rhf-inside', blogSlug: '2023-11-26-react-hook-form-inside' },
    ],
  },
  {
    id: 'language',
    links: [
      { id: 'typescript', blogSlug: '2022-01-16-typescript' },
      { id: 'typescript7', blogSlug: '2026-07-14-typescript7.0' },
      { id: 'javascript', blogSlug: '2022-03-28-javascript' },
      { id: 'ecmascript', blogSlug: '2023-08-15-ecmascript' },
      { id: 'nodejs', blogSlug: '2023-08-25-nodejs' },
      { id: 'deno', blogSlug: '2021-12-01-deno' },
      { id: 'webassembly', blogSlug: '2022-01-08-webassembly' },
    ],
  },
  {
    id: 'styling',
    links: [
      { id: 'css-in-js', blogSlug: '2022-05-31-css-in-js' },
      { id: 'emotion', blogSlug: '2022-07-23-emotion' },
      { id: 'fe-performance', blogSlug: '2020-09-12-fe-performance' },
      { id: 'gif-to-mp4', blogSlug: '2025-02-09-git-to-mp4-convert' },
    ],
  },
  {
    id: 'etc',
    links: [
      { id: 'fe-process', blogSlug: '2023-01-01-fe-process' },
      { id: 'cors', blogSlug: '2024-01-14-cors' },
      { id: 'graphql', blogSlug: '2022-01-09-graphql' },
      { id: 'rxjs', blogSlug: '2022-01-10-RxJS' },
      { id: 'svelte', blogSlug: '2021-12-02-svelte' },
      { id: 'canvas', blogSlug: '2022-03-29-canvas' },
      { id: 'gatsby-v5', blogSlug: '2023-09-17-gatsby-v5' },
    ],
  },
];

/** 아카이브에 연결된 총 아티클 링크 수 */
export const studyLinkCount = studyGroups.reduce((total, group) => total + group.links.length, 0);

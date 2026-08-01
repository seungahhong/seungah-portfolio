import dayjs from 'dayjs';
import type { ICareerDetail } from '../../types';

const today = dayjs().format('YYYY.MM');

/**
 * 경력 데이터 (표시 순서대로).
 *
 * 여기에는 언어에 의존하지 않는 값만 둔다 — slug, 기간, 이미지 경로, 링크, 기술명.
 * 회사명·요약·항목 제목·불릿·이미지 대체 텍스트는 모두
 * `src/lib/i18n/{ko,en}.json`의 `career.companies.{slug}` 아래에 있다.
 *
 * 사내 식별 정보(티켓 번호·저장소명·사내 코드네임)는 담지 않는다.
 */
export const careers: ICareerDetail[] = [
  {
    slug: 'wadiz',
    legalName: 'Wadiz',
    period: `2020.11 ~ ${today}`,
    startDate: '2020-11',
    companyUrl: 'https://www.wadiz.kr',
    logo: '/wadiz_logo.png',
    techStack: [
      'React', 'TypeScript', 'Next.js 16', 'SCSS', 'Redux', 'Tanstack-query',
      'React-hook-form', 'i18next', 'MSW', 'Vite', 'pnpm', 'ESLint 9',
      'Storybook', 'Vitest', 'Playwright', 'Sentry',
      'Java', 'Spring Boot', 'Spring Cloud', 'MyBatis', 'MySQL',
      'AWS(EKS)', 'Kubernetes', 'Helm', 'Docker', 'GitHub Actions(OIDC)',
      'Claude Code', 'Qdrant', 'FastAPI',
    ],
    items: [
      {
        id: 'fe-process',
        date: `2021.07 ~ ${today}`,
        images: ['/wadiz-develop-process-logo.webp'],
        blogSlug: '2023-01-01-fe-process',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'React, Scss, Redux, React-query, Storybook, Vitest, MSW, Playwright, Typescript' },
        ],
      },
      {
        id: 'msw',
        date: `2021.11 ~ ${today}`,
        images: ['/wadiz-msw-logo1.webp', '/wadiz-msw-logo2.webp'],
        blogSlug: '2022-07-25-msw',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'React, Storybook, Vitest, Playwright, MSW' },
        ],
      },
      {
        id: 'productivity',
        date: '2022.01 ~ 2025.12',
        blogSlug: '2024-11-16-vite',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'React, Vite, pnpm, FSD, Typescript' },
        ],
      },
      {
        id: 'standardization',
        date: '2025.01 ~ 2026.07',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'ESLint 9, Prettier, stylelint, husky, GitHub Actions, Claude Code' },
        ],
      },
      {
        id: 'stability',
        date: `2022.08 ~ ${today}`,
        images: ['/wadiz-develop-playwright.png'],
        blogSlug: '2023-04-02-playwright',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'Vitest, Playwright, Cypress, Storybook, MSW, Sentry, Typescript' },
        ],
      },
      {
        id: 'performance',
        date: '2022.08 ~ 2025.06',
        blogSlug: '2025-02-09-git-to-mp4-convert',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'React, Vite, Web Performance, Core Web Vitals' },
        ],
      },
      {
        id: 'ai-workflow',
        date: '2025.06 ~ 2026.07',
        blogSlug: '2026-06-04-fe-harness',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer / AI Workflow Engineer' },
          { labelKey: 'frontend', value: 'Claude Code, MCP, FastMCP, Qdrant, FastAPI, Docker Compose' },
        ],
      },
      {
        id: 'legacy-monolith',
        date: '2020.12 ~ 2026.07',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'JSP, Spring MVC, React, Typescript, JSON-LD' },
        ],
      },
      {
        id: 'fullstack-devops',
        date: '2024.01 ~ 2026.07',
        meta: [
          { labelKey: 'role', value: 'Full-Stack Developer' },
          { labelKey: 'backend', value: 'Java, Spring Boot, Spring Cloud, MyBatis, MySQL' },
          { labelKey: 'devops', value: 'AWS EKS, Kubernetes, Helm, Docker, GitHub Actions(OIDC)' },
        ],
      },
      {
        id: 'store-detail',
        date: '2021.05 ~ 2021.08',
        images: ['/wadiz-store-detail-log1.webp', '/wadiz-store-detail-log2.png'],
        link: 'https://www.wadiz.kr/web/wboard/newsBoardDetail/7812',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'React, Scss, Redux, Redux Toolkit, React-query, Storybook, Jest, MSW' },
        ],
      },
      {
        id: 'supporter-club',
        date: '2022.02 ~ 2022.05',
        images: ['/wadiz-supporterclub-log1.png', '/wadiz-supporterclub-log2.webp'],
        link: 'https://m.blog.naver.com/m0i0n0e/222580572002',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'React, Scss, React-query, React-hook-form, Storybook, Jest, MSW' },
        ],
      },
      {
        id: 'reward-option',
        date: '2022.07 ~ 2023.06',
        images: ['/wadiz-option-change-log1.png', '/wadiz-option-change-log2.png'],
        link: 'https://www.wadiz.kr/web/wboard/newsBoardDetail/8253',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'React, Scss, React-query, Storybook, Jest, Playwright, MSW' },
        ],
      },
      {
        id: 'maker-studio',
        date: `2020.12 ~ ${today}`,
        images: ['/wadiz-operation-log1.webp', '/wadiz-operation-log2.webp'],
        link: 'https://www.wadiz.kr/web/wboard/newsBoardDetail/6918',
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'React, Scss, React-query, Redux(Redux Toolkit), React-hook-form, Storybook, Vitest, Playwright, MSW, Typescript' },
        ],
      },
    ],
    works: [
      { id: 'work-global', period: '2025 ~' },
      { id: 'work-pricing', period: '2025' },
      { id: 'work-commerce-ops', period: '2023 ~ 2024' },
      { id: 'work-story', period: '2025' },
      { id: 'work-preorder', period: '2021 ~ 2022' },
      { id: 'work-cloud', period: '2026' },
    ],
  },
  {
    slug: 'hancom',
    legalName: 'Hancom',
    period: '2016.12 ~ 2020.11',
    startDate: '2016-12',
    endDate: '2020-11',
    companyUrl: 'https://www.hancom.com',
    logo: '/hancom_logo.png',
    techStack: ['HTML', 'CSS', 'JavaScript', 'Canvas', 'Markdown'],
    items: [
      {
        id: 'webhwp-drafter',
        date: '2016.12 ~ 2020.11',
        images: ['/hancom_webhwpctrl_logo.png'],
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'HTML, CSS, Javascript, Markdown' },
        ],
      },
      {
        id: 'webhwp',
        date: '2016.12 ~ 2020.11',
        images: ['/hancom_webhwp_logo.png'],
        meta: [
          { labelKey: 'role', value: 'Front-End Developer' },
          { labelKey: 'frontend', value: 'HTML, CSS, Javascript, Canvas' },
        ],
      },
    ],
  },
  {
    slug: 'osstem',
    legalName: 'Osstem Implant',
    period: '2013.04 ~ 2016.12',
    startDate: '2013-04',
    endDate: '2016-12',
    companyUrl: 'https://www.osstem.com',
    logo: '/osstem_logo.png',
    techStack: ['C#', 'WPF', 'C', 'C++', 'MFC'],
    items: [
      {
        id: 'global-dental',
        date: '2015.09 ~ 2016.12',
        images: ['/osstem_elecchart_logo.png'],
        meta: [
          { labelKey: 'role', value: 'Medical Insurance & Charge App Windows Developer' },
          { labelKey: 'windows', value: 'C#, WPF' },
        ],
      },
      {
        id: 'domestic-dental',
        date: '2013.04 ~ 2016.12',
        images: ['/osstem_oldinsurechart_logo.png'],
        meta: [
          { labelKey: 'role', value: 'Medical Insurance & Charge App Windows Developer' },
          { labelKey: 'windows', value: 'C/C++, MFC' },
        ],
      },
    ],
  },
  {
    slug: 'bluebird',
    legalName: 'Bluebird Soft',
    period: '2010.06 ~ 2012.05',
    startDate: '2010-06',
    endDate: '2012-05',
    logo: '/bluebird_logo.png',
    techStack: ['C', 'C++', 'Win32 API', 'MFC'],
    items: [
      {
        id: 'modem-device',
        date: '2010.08 ~ 2012.05',
        images: ['/bluebird_modemdevelop_logo.png'],
        meta: [
          { labelKey: 'role', value: 'Embedded System Developer' },
          { labelKey: 'windows', value: 'C, C++, API, MFC' },
        ],
      },
      {
        id: 'wince-device',
        date: '2010.06 ~ 2012.05',
        images: ['/bluebird_windowsce_device_logo.png'],
        meta: [
          { labelKey: 'role', value: 'Embedded System Developer' },
          { labelKey: 'windows', value: 'C, C++, API, MFC' },
        ],
      },
    ],
  },
];

/** 정적 경로 생성 및 사이트맵에서 사용하는 경력 slug 목록 */
export const careerSlugs = careers.map((career) => career.slug);

export function getCareerDetail(slug: string): ICareerDetail | undefined {
  return careers.find((career) => career.slug === slug);
}

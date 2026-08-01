import { careers } from './career';

/**
 * 프로필 데이터.
 *
 * 이름·직함·소개 문구·지역 등 표시 문구는 `src/lib/i18n/{ko,en}.json`의 `profile.*`,
 * 기술 스택 그룹은 `about.skillGroups.*`에서 관리한다.
 * 여기에는 링크·이메일처럼 언어와 무관한 값만 둔다.
 */
export interface IProfileData {
  email: string;
  github: string;
  blog: string;
  portfolio: string;
  notion: string;
  /** i18n `about.skillGroups.{key}` 조회 키 (표시 순서) */
  skillGroupKeys: string[];
  /** JSON-LD `knowsAbout` — 검색엔진용 엔티티 정의라 영문 표준 용어로 고정한다 */
  knowsAbout: string[];
}

export const profileData: IProfileData = {
  email: 'gmm117@naver.com',
  github: 'https://github.com/seungahhong',
  blog: 'https://seungahhong.github.io/',
  portfolio: 'https://seungah-portfolio.vercel.app/',
  notion: 'https://material-debt-c1c.notion.site/daa60481e37840ea9e1b7e1b12269942',
  skillGroupKeys: [
    'frontend',
    'build',
    'test',
    'devops',
    'ai',
    'monitoring',
    'collaboration',
  ],
  knowsAbout: [
    'Frontend Engineering',
    'React',
    'Next.js',
    'TypeScript',
    'Web Performance Optimization',
    'Test Automation',
    'Design System',
    'Legacy Modernization',
    'Internationalization (i18n)',
    'Cloud Migration',
    'AI Workflow Engineering',
    'Retrieval-Augmented Generation (RAG)',
  ],
};

/** 블로그 운영 지표 — GEO(생성형 검색 최적화)에서 인용 근거가 되는 구체 수치 */
export const blogStats = {
  /** 한국어 아티클 편수 */
  articles: 69,
  /** 한/영 이중 언어 총 문서 수 */
  documents: 138,
  /** 최초 작성 연도 */
  since: 2020,
} as const;

/** 경력 데이터에서 실제 재직 개월 수를 합산한다 (공백 기간 제외) */
function totalExperienceMonths(): number {
  return careers.reduce((total, company) => {
    const [startYear, startMonth] = company.startDate.split('-').map(Number);
    const end = company.endDate ? company.endDate.split('-').map(Number) : null;
    const now = new Date();
    const endYear = end ? end[0] : now.getFullYear();
    const endMonth = end ? end[1] : now.getMonth() + 1;
    return total + (endYear - startYear) * 12 + (endMonth - startMonth);
  }, 0);
}

/** 총 경력 연차 (내림) — 화면 문구와 구조화 데이터가 같은 값을 참조하도록 단일 소스로 관리 */
export const experienceYears = Math.floor(totalExperienceMonths() / 12);

/** JSON-LD `sameAs` — 엔티티 신뢰도를 높이는 외부 프로필 링크 */
export const profileSameAs = [
  profileData.github,
  profileData.blog,
  profileData.notion,
];

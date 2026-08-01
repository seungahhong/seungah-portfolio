/**
 * 경력(Career) 도메인 타입.
 *
 * 이 파일의 데이터는 **언어에 의존하지 않는 구조만** 담는다.
 * 제목·요약·불릿·이미지 대체 텍스트 등 모든 표시 문구는
 * `src/lib/i18n/{ko,en}.json`의 `career.companies.{slug}` 아래에서 관리한다.
 *
 * 외부에서 참조할 수 있는 경로:
 * - 전용 페이지: `/career/{slug}`
 * - 해시 앵커:   `/career/{slug}#{item.id}`
 */

/** 메타 라벨 i18n 키 — `career.labels.{labelKey}` */
type CareerMetaLabelKey = 'role' | 'frontend' | 'backend' | 'devops' | 'windows';

/**
 * 상세 항목 메타 (Role, 기술 스택 등). 라벨은 항상 i18n이고, 값은 둘 중 하나다.
 *
 * - `value`   — 기술명처럼 **언어와 무관한** 고유명사 (`React, Vite, Typescript`)
 * - `valueKey` — 직무명처럼 **번역이 필요한** 값. `career.roles.{valueKey}`에서 읽는다
 *
 * 둘을 동시에 쓸 수 없다. 값을 데이터에 직접 적으면 한/영 어느 한쪽이 반쪽이 되므로,
 * 문장으로 읽히는 값은 반드시 `valueKey`를 쓴다.
 */
export type ICareerMeta =
  | { labelKey: CareerMetaLabelKey; value: string; valueKey?: never }
  | { labelKey: CareerMetaLabelKey; valueKey: string; value?: never };

/** 기술내용 / 대표 프로젝트 단위 상세 항목 */
export interface ICareerProjectItem {
  /** 해시 앵커 id이자 i18n 키 — `/career/wadiz#msw`, `career.companies.wadiz.items.msw` */
  id: string;
  date: string;
  /** 이미지 경로. 대체 텍스트는 i18n `items.{id}.imageAlts[index]`에서 읽는다 */
  images?: string[];
  /** 기술블로그 글 근거 — slug만 저장하고 로케일에 맞는 URL을 런타임에 만든다 */
  blogSlug?: string;
  /** 그 외 외부 근거 링크(절대 URL). 표시 텍스트는 i18n `items.{id}.linkTitle`에서 읽는다 */
  link?: string;
  meta?: ICareerMeta[];
}

/** 업무내용 그룹 — 제목·불릿은 i18n `works.{id}`에서 읽는다 */
export interface ICareerWorkGroup {
  /** 해시 앵커 id이자 i18n 키 */
  id: string;
  period?: string;
}

/** 회사 단위 데이터 */
export interface ICareerDetail {
  /** 라우팅 키이자 i18n 키 — `career.companies.{slug}` */
  slug: string;
  /** 표시용 기간 문자열 */
  period: string;
  /** ISO 기간 — JSON-LD `startDate` / `endDate` */
  startDate: string;
  endDate?: string;
  companyUrl?: string;
  /** JSON-LD `Organization.name` — 영문 상호는 로케일과 무관한 고유명사다 */
  legalName: string;
  logo: string;
  /** 이력서 "기술 ·" 라인 */
  techStack: string[];
  /** 기술내용 / 대표 프로젝트 */
  items: ICareerProjectItem[];
  /** 업무내용 */
  works?: ICareerWorkGroup[];
}

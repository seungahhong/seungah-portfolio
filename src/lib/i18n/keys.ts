/**
 * ko.json에서 파생한 번역 키 유니온.
 *
 * 왜 필요한가: `t()`는 키를 못 찾으면 키 문자열을 그대로 반환한다. 예외가 나지 않으므로
 * 오타는 lint·typecheck·build를 전부 통과해 배포 HTML에 그대로 박힌다(실측).
 * 키를 유니온으로 만들면 그 오타가 typecheck 오류(0.6초)가 되고,
 * TS가 `Did you mean '"profile.role"'?`까지 알려준다.
 *
 * `resolveJsonModule`이 켜져 있어 코드 생성 단계 없이 ko.json이 곧 스키마가 된다
 * — 생성물과 원본이 어긋날 여지가 없다.
 *
 * 한계: `${slug}.items.${itemId}` 같은 2단 교차곱 동적 키는 원리적으로 검사할 수 없다
 * (TS가 실존하지 않는 조합까지 전개한다). 그쪽은 `DynamicKey`로 이스케이프하고
 * scripts/i18n-guard.mjs가 실제 데이터 id를 실제 JSON과 대조해 대신 지킨다.
 */
import type ko from './ko.json';

type Join<P extends string, K extends string> = P extends '' ? K : `${P}.${K}`;

/** 문자열 리프로 가는 경로 — `t()`가 받는 키 */
type StringPaths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? Join<P, K>
    : T[K] extends readonly unknown[]
      ? never
      : StringPaths<T[K], Join<P, K>>;
}[keyof T & string];

/** 배열 리프로 가는 경로 — `tList()`가 받는 키 */
type ListPaths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? never
    : T[K] extends readonly unknown[]
      ? Join<P, K>
      : ListPaths<T[K], Join<P, K>>;
}[keyof T & string];

export type TranslationKey = StringPaths<typeof ko>;
export type TranslationListKey = ListPaths<typeof ko>;

/**
 * 2단 이상 동적으로 조립되는 키의 명시적 이스케이프.
 *
 * 타입 검사를 포기한 자리가 코드에서 눈에 보이도록 일부러 greppable하게 둔다.
 * 프리픽스는 여전히 타입으로 남으므로 `careeer.companies.x` 같은 오타는 잡힌다.
 * 이 자리를 대신 지키는 것은 scripts/i18n-guard.mjs의 데이터 계약 검사(R7)다.
 */
export type DynamicKey =
  | `career.companies.${string}`
  | `career.roles.${string}`
  | `faq.items.${string}`
  | `projects.items.${string}`
  | `projects.talks.${string}`
  | `about.skillGroups.${string}`
  | `study.groups.${string}`;

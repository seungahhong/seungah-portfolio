/**
 * 로케일 타입. 의존 방향이 `lib → types` 한 방향이 되도록 여기에 둔다.
 *
 * 이전에는 `src/lib/i18n/constants.ts`가 이 타입을 소유했고 `types/project.ts`가 거꾸로
 * 그것을 import했다 — `import type`이라 런타임 순환은 아니었지만, 문서에 적힌 계층 그래프와
 * 어긋난 채로 남아 있었다. 그래프가 참이어야 에이전트가 그것을 믿고 따를 수 있다.
 *
 * `constants.ts`가 이 타입을 재수출하므로 `@/lib/i18n`에서 가져오던 기존 import는 그대로 동작한다.
 */
export type Locale = 'ko' | 'en';

import ko from './ko.json';
import en from './en.json';
import type { TranslationKey, TranslationListKey, DynamicKey } from './keys';

export type { TranslationKey, TranslationListKey, DynamicKey };

/**
 * `t()`가 실제로 받는 키 — 정적 키이거나, 명시적으로 이스케이프된 동적 키다.
 * 키를 prop이나 데이터로 들고 다니는 곳(`labelKey` 등)은 `string`이 아니라 이 타입을 쓴다.
 * `string`으로 두면 유니온이 그 지점에서 끊겨 오타 검사가 무력해진다.
 */
export type TKey = TranslationKey | DynamicKey;
export type TListKey = TranslationListKey | DynamicKey;

const translations: Record<string, unknown> = { ko, en };

const DEFAULT_LOCALE = 'ko';

function lookup(dict: unknown, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, segment) =>
        node && typeof node === 'object'
          ? (node as Record<string, unknown>)[segment]
          : undefined,
      dict
    );
}

/** 점 표기 경로(`career.companies.wadiz.summary`)를 중첩 JSON에서 해석한다 */
function resolve(locale: string, key: string): unknown {
  const dict = translations[locale] ?? translations[DEFAULT_LOCALE];
  const found = lookup(dict, key);

  if (found !== undefined || locale === DEFAULT_LOCALE) return found;

  // 번역이 비어 있으면 원문(한국어)으로 폴백해 화면이 비지 않게 한다
  return lookup(translations[DEFAULT_LOCALE], key);
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

/**
 * 서버 사이드 번역 함수.
 * Server Component에서 사용 — 훅이 없으므로 `'use client'`가 필요 없다.
 *
 * `params`를 넘기면 `{name}` 형태의 자리표시자를 치환한다.
 */
export function t(
  locale: string,
  key: TKey,
  params?: Record<string, string | number>
): string {
  const value = resolve(locale, key);
  if (typeof value !== 'string') return key;
  return params ? interpolate(value, params) : value;
}

/** 불릿 목록처럼 배열로 관리되는 번역을 읽는다 */
export function tList(
  locale: string,
  key: TListKey,
  params?: Record<string, string | number>
): string[] {
  const value = resolve(locale, key);
  if (!Array.isArray(value)) return [];
  return value.map((item) =>
    typeof item === 'string' ? (params ? interpolate(item, params) : item) : String(item)
  );
}

/** 번역 키 존재 여부 — 선택적 항목(링크 제목 등) 렌더링 분기에 사용한다 */
export function hasTranslation(locale: string, key: TKey | TListKey): boolean {
  return resolve(locale, key) !== undefined;
}

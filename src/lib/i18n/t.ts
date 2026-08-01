import ko from './ko.json';
import en from './en.json';

export type TranslationKey = string;

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
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const value = resolve(locale, key);
  if (typeof value !== 'string') return key;
  return params ? interpolate(value, params) : value;
}

/** 불릿 목록처럼 배열로 관리되는 번역을 읽는다 */
export function tList(
  locale: string,
  key: TranslationKey,
  params?: Record<string, string | number>
): string[] {
  const value = resolve(locale, key);
  if (!Array.isArray(value)) return [];
  return value.map((item) =>
    typeof item === 'string' ? (params ? interpolate(item, params) : item) : String(item)
  );
}

/** 번역 키 존재 여부 — 선택적 항목(링크 제목 등) 렌더링 분기에 사용한다 */
export function hasTranslation(locale: string, key: TranslationKey): boolean {
  return resolve(locale, key) !== undefined;
}

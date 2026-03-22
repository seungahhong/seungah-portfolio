import ko from './ko.json';
import en from './en.json';

type TranslationKey = keyof typeof ko;

const translations: Record<string, Record<string, string>> = { ko, en };

/**
 * Server-side translation function.
 * Use in Server Components — no hooks, no 'use client' required.
 */
export function t(locale: string, key: TranslationKey | string): string {
  const dict = translations[locale] || translations['ko'];
  return dict[key] || key;
}

export type { TranslationKey };

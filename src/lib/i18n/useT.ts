'use client';

import { useContext } from 'react';
import { I18nContext } from './provider';
import { t, type TranslationKey } from './t';

/**
 * Client-side translation hook.
 * Use in Client Components — reads locale from I18nProvider context.
 */
export function useT() {
  const { locale } = useContext(I18nContext);

  return {
    t: (key: TranslationKey | string) => t(locale, key),
    locale,
  };
}

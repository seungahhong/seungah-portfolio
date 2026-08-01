'use client';

import { useContext, useMemo } from 'react';
import { I18nContext } from './provider';
import { t, tList, hasTranslation, type TranslationKey } from './t';

/**
 * 클라이언트 사이드 번역 훅.
 * Client Component에서 사용 — I18nProvider 컨텍스트의 로케일을 읽는다.
 */
export function useT() {
  const { locale } = useContext(I18nContext);

  return useMemo(
    () => ({
      t: (key: TranslationKey, params?: Record<string, string | number>) =>
        t(locale, key, params),
      tList: (key: TranslationKey, params?: Record<string, string | number>) =>
        tList(locale, key, params),
      has: (key: TranslationKey) => hasTranslation(locale, key),
      locale,
    }),
    [locale]
  );
}

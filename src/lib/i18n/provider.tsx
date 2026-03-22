'use client';

import { createContext, useCallback, useState, type ReactNode } from 'react';

export type Locale = 'ko' | 'en';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const I18nContext = createContext<I18nContextValue>({
  locale: 'ko',
  setLocale: () => {},
  toggleLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('locale') as Locale) || 'ko';
    }
    return 'ko';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'ko' ? 'en' : 'ko');
  }, [locale, setLocale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

'use client';

import { useContext } from 'react';
import { I18nContext } from '@/lib/i18n/provider';

export function LanguageToggle() {
  const { locale, toggleLocale } = useContext(I18nContext);

  return (
    <button
      onClick={toggleLocale}
      className="h-8 px-3 rounded-full text-xs font-medium text-[#86868b] hover:text-[var(--foreground)] transition-colors duration-200"
      aria-label={`Switch to ${locale === 'ko' ? 'English' : '한국어'}`}
    >
      {locale === 'ko' ? 'EN' : 'KO'}
    </button>
  );
}

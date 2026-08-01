'use client';

import { ThemeProvider } from 'next-themes';
import { I18nProvider } from '@/lib/i18n/provider';
import { TabProvider } from '@/components/providers/TabContext';
import type { Locale } from '@/lib/i18n/constants';

export function ClientProviders({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider locale={locale}>
        <TabProvider>{children}</TabProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

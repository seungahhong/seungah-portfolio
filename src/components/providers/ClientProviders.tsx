'use client';

import { Suspense } from 'react';
import { ThemeProvider } from 'next-themes';
import { I18nProvider } from '@/lib/i18n/provider';
import { TabProvider } from '@/components/providers/TabContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <Suspense fallback={null}>
          <TabProvider>
            {children}
          </TabProvider>
        </Suspense>
      </I18nProvider>
    </ThemeProvider>
  );
}

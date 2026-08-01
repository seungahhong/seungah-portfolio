import { Geist, Geist_Mono } from 'next/font/google';
import '@/app/globals.css';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { SiteHeader } from '@/components/layout/SiteHeader';
import type { Locale } from '@/lib/i18n/constants';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/**
 * 로케일별 루트 레이아웃의 공통 뼈대.
 *
 * `<html lang>`은 루트 레이아웃에서만 지정할 수 있으므로, 한국어(`/`)와 영어(`/en`)가
 * 각각 자기 루트 레이아웃을 갖는다. 두 레이아웃은 이 컴포넌트만 로케일을 바꿔 렌더링한다.
 * 덕분에 서버 렌더링 시점부터 `lang`, 헤더, 챗 탭까지 전부 올바른 언어로 나온다.
 */
export function RootShell({
  locale,
  children,
}: Readonly<{ locale: Locale; children: React.ReactNode }>) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        <ClientProviders locale={locale}>
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1 relative">
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}

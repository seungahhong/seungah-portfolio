import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { TabNavigation } from '@/components/layout/TabNavigation';
import { TabContentWrapper } from '@/components/layout/TabContentWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '홍승아 포트폴리오 | Seungah Hong Portfolio',
  description:
    '도전하고 노력하며 공유하는 프론트엔드 개발자, 홍승아의 포트폴리오입니다. Frontend Developer Portfolio.',
  openGraph: {
    title: '홍승아 포트폴리오 | Seungah Hong Portfolio',
    description: '프론트엔드 개발자 홍승아의 포트폴리오',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        <ClientProviders>
          <div className="min-h-screen flex flex-col">
            <TabNavigation />
            <main className="flex-1 relative">
              <TabContentWrapper>
                {children}
              </TabContentWrapper>
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}

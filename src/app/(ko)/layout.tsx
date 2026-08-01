import { RootShell } from '@/components/layout/RootShell';
import { buildRootMetadata, rootViewport } from '@/lib/seo/metadata';

/** 기본 로케일(한국어) 루트 레이아웃 — 접두사 없는 `/`, `/career/*`, `/contact`를 담당한다 */
export const metadata = buildRootMetadata('ko');
export const viewport = rootViewport;

export default function KoRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell locale="ko">{children}</RootShell>;
}

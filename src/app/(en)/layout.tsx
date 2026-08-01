import { RootShell } from '@/components/layout/RootShell';
import { buildRootMetadata, rootViewport } from '@/lib/seo/metadata';

/**
 * 영어 루트 레이아웃 — `/en` 이하를 담당한다.
 * `<html lang>`은 루트 레이아웃에서만 지정할 수 있어 로케일별로 루트를 분리했다.
 */
export const metadata = buildRootMetadata('en');
export const viewport = rootViewport;

export default function EnRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell locale="en">{children}</RootShell>;
}

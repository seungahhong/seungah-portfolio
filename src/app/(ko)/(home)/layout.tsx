import { HomeShell } from '@/components/pages/HomeShell';

export default function KoHomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <HomeShell locale="ko">{children}</HomeShell>;
}

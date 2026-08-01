import { HomeShell } from '@/components/pages/HomeShell';

export default function EnHomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <HomeShell locale="en">{children}</HomeShell>;
}

import { cookies } from 'next/headers';
import PortfolioContent from '@/components/portfolio/PortfolioContent';

export default async function Home() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'ko';

  return <PortfolioContent locale={locale} />;
}

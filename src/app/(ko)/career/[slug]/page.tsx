import type { Metadata } from 'next';
import { careerSlugs } from '@/helpers';
import { CareerDetailView } from '@/components/pages/CareerDetailView';
import { buildCareerMetadata } from '@/lib/seo/metadata';

export function generateStaticParams() {
  return careerSlugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

interface CareerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CareerPageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildCareerMetadata('ko', slug);
}

export default async function KoCareerDetailPage({ params }: CareerPageProps) {
  const { slug } = await params;
  return <CareerDetailView locale="ko" slug={slug} />;
}

import type { Locale } from '@/lib/i18n/constants';
import AboutSection from '@/components/portfolio/AboutSection';
import CareerSection from '@/components/portfolio/CareerSection';
import ProjectSection from '@/components/portfolio/ProjectSection';
import StudySection from '@/components/portfolio/StudySection';
import FaqSection from '@/components/portfolio/FaqSection';
import ContactSection from '@/components/portfolio/ContactSection';

interface PortfolioContentProps {
  locale: Locale;
}

export default function PortfolioContent({ locale }: PortfolioContentProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
      <AboutSection locale={locale} />
      <CareerSection locale={locale} />
      <ProjectSection locale={locale} />
      <StudySection locale={locale} />
      <FaqSection locale={locale} />
      <ContactSection locale={locale} />
    </div>
  );
}

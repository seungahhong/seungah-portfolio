import type { Locale } from '@/lib/i18n/constants';
import { t } from '@/lib/i18n/t';
import { careers, experienceYears } from '@/helpers';
import CareerCard from './CareerCard';

interface CareerSectionProps {
  locale: Locale;
}

export default function CareerSection({ locale }: CareerSectionProps) {
  return (
    <section id="career" aria-labelledby="career-heading" className="py-20 scroll-mt-28">
      <h2
        id="career-heading"
        className="text-4xl font-bold tracking-tight mb-4 animate-fade-in-up"
        style={{ letterSpacing: '-0.03em' }}
      >
        {t(locale, 'career.title')}
      </h2>
      <p className="text-[var(--text-muted)] mb-12 animate-fade-in-up stagger-1">
        {t(locale, 'career.subtitle', {
          years: experienceYears,
          companies: careers.length,
        })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {careers.map((career, i) => (
          <div key={career.slug} className={`animate-fade-in-up stagger-${i + 2}`}>
            <CareerCard career={career} locale={locale} />
          </div>
        ))}
      </div>
    </section>
  );
}

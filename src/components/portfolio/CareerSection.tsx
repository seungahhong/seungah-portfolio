import { t } from '@/lib/i18n/t';
import { careerProjectValues } from '@/helpers';
import CareerCard from './CareerCard';

interface CareerSectionProps {
  locale: string;
}

export default function CareerSection({ locale }: CareerSectionProps) {
  return (
    <section id="career" aria-labelledby="career-heading" className="py-20">
      <h2
        id="career-heading"
        className="text-4xl font-bold tracking-tight mb-4 animate-fade-in-up"
        style={{ letterSpacing: '-0.03em' }}
      >
        {t(locale, 'career.title')}
      </h2>
      <p className="text-[#86868b] mb-12 animate-fade-in-up stagger-1">
        {locale === 'ko' ? '14년 이상의 개발 경험' : '14+ years of development experience'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {careerProjectValues.map((career, i) => (
          <div key={career.href} className={`animate-fade-in-up stagger-${i + 2}`}>
            <CareerCard career={career} careerKey={career.href} locale={locale} />
          </div>
        ))}
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useT } from '@/lib/i18n/useT';
import { careers } from '@/helpers';
import { localizedPath } from '@/lib/i18n/constants';
import SkillBadge from '@/components/ui/SkillBadge';

export function CareerResponseCard() {
  const { t, locale } = useT();

  return (
    <div className="space-y-3 mt-2 mb-2">
      {careers.map((career, i) => {
        const base = `career.companies.${career.slug}`;
        const techStack = career.techStack.slice(0, 6);

        return (
          <div key={career.slug} className={`apple-surface p-5 animate-fade-in-up stagger-${i + 1}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-[var(--surface-secondary)] flex items-center justify-center">
                <Image
                  src={career.logo}
                  alt={t(`${base}.logoAlt`)}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-tight text-[var(--foreground)]">
                  {t(`${base}.title`)}
                </p>
                <p className="text-xs text-[#86868b]">
                  {t(`${base}.role`)} · {career.period}
                </p>
              </div>
            </div>
            <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] mb-3 line-clamp-2 leading-relaxed">
              {t(`${base}.description`)}
            </p>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {techStack.map((tech) => (
                  <SkillBadge key={tech} label={tech} />
                ))}
              </div>
            )}
            <Link
              href={localizedPath(locale, `/career/${career.slug}`)}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
            >
              {t('career.details')}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

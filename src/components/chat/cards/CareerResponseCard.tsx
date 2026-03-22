'use client';

import Image from 'next/image';
import { useT } from '@/lib/i18n/useT';
import { careerProjectValues } from '@/helpers';
import SkillBadge from '@/components/ui/SkillBadge';
import { careerProjectDetailType } from '@/helpers';

export function CareerResponseCard() {
  const { t } = useT();

  return (
    <div className="space-y-3 mt-2 mb-2">
      {careerProjectValues.map((career, i) => {
        const detail = careerProjectDetailType[career.href];
        const techStackSet = new Set<string>();
        detail?.items.forEach((item) => {
          item.description.labels.forEach((label) => {
            if (label.name === 'Frontend' || label.name === 'Windows') {
              label.value.data.split(',').forEach((tech) => techStackSet.add(tech.trim()));
            }
          });
        });
        const techStack = Array.from(techStackSet).slice(0, 6);

        return (
          <div
            key={career.href}
            className={`apple-surface p-5 animate-fade-in-up stagger-${i + 1}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-[var(--surface-secondary)] flex items-center justify-center">
                <Image
                  src={career.image.src}
                  alt={career.image.alt}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-tight text-[var(--foreground)]">
                  {t(`career.${career.href}.title`)}
                </p>
                <p className="text-xs text-[#86868b]">
                  {t(`career.${career.href}.role`)} · {career.date}
                </p>
              </div>
            </div>
            <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] mb-3 line-clamp-2 leading-relaxed">
              {t(`career.${career.href}.description`)}
            </p>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((tech) => (
                  <SkillBadge key={tech} label={tech} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

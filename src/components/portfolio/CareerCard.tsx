import Image from 'next/image';
import { t } from '@/lib/i18n/t';
import { careerProjectDetailType } from '@/helpers';
import type { ICardItemProps } from '@/types/card';
import SkillBadge from '@/components/ui/SkillBadge';

interface CareerCardProps {
  career: ICardItemProps;
  careerKey: string;
  locale: string;
}

export default function CareerCard({ career, careerKey, locale }: CareerCardProps) {
  const detail = careerProjectDetailType[careerKey];
  const role = t(locale, `career.${careerKey}.role`);
  const description = t(locale, `career.${careerKey}.description`);

  const techStackSet = new Set<string>();
  detail?.items.forEach((item) => {
    item.description.labels.forEach((label) => {
      if (label.name === 'Frontend' || label.name === 'Windows') {
        label.value.data.split(',').forEach((tech) => techStackSet.add(tech.trim()));
      }
    });
  });
  const techStack = Array.from(techStackSet).slice(0, 8);

  return (
    <article className="apple-surface p-7 sm:p-8 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="shrink-0 w-12 h-12 rounded-2xl overflow-hidden bg-[var(--surface-secondary)] flex items-center justify-center">
          <Image
            src={career.image.src}
            alt={career.image.alt}
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold tracking-tight">
            {t(locale, `career.${careerKey}.title`)}
          </h3>
          <p className="text-sm text-[#86868b]">{role}</p>
          <p className="text-xs text-[#86868b] mt-0.5">{career.date}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#424245] dark:text-[#a1a1a6] mb-5 leading-relaxed flex-1">
        {description}
      </p>

      {/* Tech stack */}
      {techStack.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#86868b] mb-2">
            {t(locale, 'career.techStack')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {techStack.map((tech) => (
              <SkillBadge key={tech} label={tech} />
            ))}
          </div>
        </div>
      )}

      {/* Details accordion */}
      {detail?.items && detail.items.length > 0 && (
        <details className="group border-t border-[var(--border)] pt-4">
          <summary className="cursor-pointer text-sm font-medium text-[var(--accent)] hover:underline list-none flex items-center gap-1.5 select-none">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-open:rotate-90"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            {t(locale, 'career.details')}
          </summary>

          <div className="mt-4 space-y-5">
            {detail.items.map((project) => (
              <div
                key={project.title}
                className="border-t border-[var(--border)] pt-4 first:border-0 first:pt-0"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold">{project.title}</h4>
                  <span className="text-[10px] text-[#86868b] shrink-0">{project.date}</span>
                </div>

                {project.images && project.images.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {project.images.map((img) => (
                      <div key={img.src} className="rounded-xl overflow-hidden border border-[var(--border)]">
                        <Image src={img.src} alt={img.alt} width={140} height={88} className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <ul className="space-y-1">
                  {(Array.isArray(project.description['sub-discription'])
                    ? project.description['sub-discription']
                    : [project.description['sub-discription']]
                  ).map((desc, idx) => (
                    <li key={idx} className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed before:content-['·'] before:mr-1.5 before:text-[#86868b]">
                      {desc}
                    </li>
                  ))}
                </ul>

                {project.description.labels.map((label) =>
                  label.value.type === 'link' ? (
                    <a
                      key={label.name}
                      href={label.value.data}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-[var(--accent)] hover:underline transition-colors"
                    >
                      {label.value.title || label.value.data}
                    </a>
                  ) : null
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </article>
  );
}

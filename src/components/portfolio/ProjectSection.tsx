import Image from 'next/image';
import { t } from '@/lib/i18n/t';
import { personalProjects, presentations } from '@/helpers';
import SkillBadge from '@/components/ui/SkillBadge';

interface ProjectSectionProps {
  locale: string;
}

export default function ProjectSection({ locale }: ProjectSectionProps) {
  return (
    <section id="projects" aria-labelledby="projects-heading" className="py-20">
      <h2
        id="projects-heading"
        className="text-4xl font-bold tracking-tight mb-4 animate-fade-in-up"
        style={{ letterSpacing: '-0.03em' }}
      >
        {t(locale, 'projects.title')}
      </h2>
      <p className="text-[#86868b] mb-12 animate-fade-in-up stagger-1">
        {t(locale, 'projects.personal')}
      </p>

      {/* Personal Projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
        {personalProjects.map((project, i) => (
          <article
            key={project.key}
            className={`apple-surface overflow-hidden animate-fade-in-up stagger-${i + 2}`}
          >
            <div className="aspect-video w-full overflow-hidden">
              <Image
                src={project.image}
                alt={t(locale, `projects.${project.key}.title`)}
                width={600}
                height={338}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="p-7">
              <h4 className="text-lg font-bold tracking-tight mb-2">
                {t(locale, `projects.${project.key}.title`)}
              </h4>
              <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] mb-4 leading-relaxed">
                {t(locale, `projects.${project.key}.description`)}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {project.techStack.map((tech) => (
                  <SkillBadge key={tech} label={tech} />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#86868b]">{project.deploy}</span>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline transition-colors"
                >
                  Visit
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Presentations */}
      <h3 className="text-2xl font-bold tracking-tight mb-6 animate-fade-in-up" style={{ letterSpacing: '-0.02em' }}>
        {t(locale, 'projects.presentation')}
      </h3>
      <div className="space-y-4">
        {presentations.map((pres, i) => (
          <article
            key={pres.key}
            className={`apple-surface p-6 flex items-start gap-5 animate-fade-in-up stagger-${i + 1}`}
          >
            <div className="shrink-0 w-14 h-14 rounded-2xl overflow-hidden bg-[var(--surface-secondary)]">
              <Image
                src={pres.image}
                alt={t(locale, `projects.${pres.key}.title`)}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-base font-bold tracking-tight">
                  {t(locale, `projects.${pres.key}.title`)}
                </h4>
                <span className="text-xs text-[#86868b] shrink-0">{pres.date}</span>
              </div>
              <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] mb-3 leading-relaxed">
                {t(locale, `projects.${pres.key}.description`)}
              </p>
              <a
                href={pres.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                View
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

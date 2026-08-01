import Image from 'next/image';
import { t } from '@/lib/i18n/t';
import { personalProjects, presentations } from '@/helpers';
import SkillBadge from '@/components/ui/SkillBadge';
import { blogHomeUrl, blogPostUrl } from '@/lib/blog';
import type { Locale } from '@/lib/i18n/constants';
import AnchorLink from '@/components/ui/AnchorLink';

interface ProjectSectionProps {
  locale: Locale;
}

const ExternalIcon = () => (
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
    <path d="M7 17 17 7M7 7h10v10" />
  </svg>
);

/** 개인 프로젝트와 발표·기고가 같은 카드 레이아웃을 공유한다 */
const CARD_CLASS = 'apple-surface overflow-hidden flex flex-col scroll-mt-32 group';

export default function ProjectSection({ locale }: ProjectSectionProps) {
  return (
    <section id="projects" aria-labelledby="projects-heading" className="py-20 scroll-mt-28">
      <h2
        id="projects-heading"
        className="text-4xl font-bold tracking-tight mb-4 animate-fade-in-up"
        style={{ letterSpacing: '-0.03em' }}
      >
        {t(locale, 'projects.title')}
      </h2>
      <p className="text-[#86868b] mb-12 animate-fade-in-up stagger-1">
        {t(locale, 'projects.subtitle')}
      </p>

      {/* Personal Projects */}
      <h3
        className="text-2xl font-bold tracking-tight mb-6 animate-fade-in-up"
        style={{ letterSpacing: '-0.02em' }}
      >
        {t(locale, 'projects.personal')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
        {personalProjects.map((project, i) => {
          const anchorId = `project-${project.key}`;
          const title = t(locale, `projects.items.${project.key}.title`);
          // 기술블로그처럼 언어별 주소가 있는 경우 화면 로케일에 맞춘다
          const visitUrl = project.localizedUrl === 'blog' ? blogHomeUrl(locale) : project.url;

          return (
            <article
              key={project.key}
              id={anchorId}
              className={`${CARD_CLASS} animate-fade-in-up stagger-${i + 2}`}
            >
              <div className="aspect-video w-full overflow-hidden">
                <Image
                  src={project.image}
                  alt={t(locale, 'projects.screenshotAlt', { title })}
                  width={600}
                  height={338}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-lg font-bold tracking-tight">{title}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[#86868b]">{project.period}</span>
                    <AnchorLink
                      href={`#${anchorId}`}
                      label={`${title} ${t(locale, 'career.anchorLabel')}`}
                    />
                  </div>
                </div>
                <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] mb-4 leading-relaxed">
                  {t(locale, `projects.items.${project.key}.description`)}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {project.techStack.map((tech) => (
                    <SkillBadge key={tech} label={tech} />
                  ))}
                </div>

                {/* 링크 영역은 카드 높이와 무관하게 항상 하단에 고정한다 */}
                <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
                  <span className="text-xs text-[#86868b]">{project.deploy}</span>
                  <div className="flex items-center gap-4">
                    {project.repo && (
                      <a
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#86868b] hover:text-[var(--accent)] transition-colors"
                      >
                        {t(locale, 'projects.repo')}
                        <ExternalIcon />
                      </a>
                    )}
                    <a
                      href={visitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline transition-colors"
                    >
                      {t(locale, 'projects.visit')}
                      <ExternalIcon />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Presentations & Articles — 개인 프로젝트와 동일한 카드 레이아웃 */}
      <h3
        className="text-2xl font-bold tracking-tight mb-6 animate-fade-in-up"
        style={{ letterSpacing: '-0.02em' }}
      >
        {t(locale, 'projects.presentation')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {presentations.map((pres, i) => {
          const anchorId = `project-${pres.key}`;
          const title = t(locale, `projects.items.${pres.key}.title`);
          const mainUrl = pres.blogSlug ? blogPostUrl(locale, pres.blogSlug) : pres.url;

          return (
            <article
              key={pres.key}
              id={anchorId}
              className={`${CARD_CLASS} animate-fade-in-up stagger-${i + 2}`}
            >
              <div className="aspect-video w-full overflow-hidden bg-[var(--surface-secondary)]">
                <Image
                  src={pres.image}
                  alt={t(locale, 'projects.coverAlt', { title })}
                  width={600}
                  height={338}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-lg font-bold tracking-tight">{title}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[#86868b]">{pres.date}</span>
                    <AnchorLink
                      href={`#${anchorId}`}
                      label={`${title} ${t(locale, 'career.anchorLabel')}`}
                    />
                  </div>
                </div>
                <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] mb-4 leading-relaxed">
                  {t(locale, `projects.items.${pres.key}.description`)}
                </p>

                {pres.links && (
                  <ul className="space-y-1.5 mb-5">
                    {pres.links.map((link) => (
                      <li key={link.id}>
                        <a
                          href={blogPostUrl(locale, link.blogSlug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-start gap-1 text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[var(--accent)] transition-colors leading-relaxed"
                        >
                          {t(locale, `projects.items.${pres.key}.links.${link.id}`)}
                          <span className="mt-1">
                            <ExternalIcon />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
                  <span className="text-xs text-[#86868b]">
                    {pres.links
                      ? t(locale, 'projects.articleCount', { count: pres.links.length })
                      : ''}
                  </span>
                  <a
                    href={mainUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
                  >
                    {t(locale, 'projects.view')}
                    <ExternalIcon />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

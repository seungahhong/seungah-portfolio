import { t } from '@/lib/i18n/t';
import { blogStats, studyGroups, studyLinkCount } from '@/helpers';
import { blogHomeUrl, blogPostUrl } from '@/lib/blog';
import type { Locale } from '@/lib/i18n/constants';
import AnchorLink from '@/components/ui/AnchorLink';

interface StudySectionProps {
  locale: Locale;
}

/**
 * Personal Study — 기술블로그 아티클 아카이브.
 *
 * 주제군별 내부 링크 클러스터를 구성해 학습 궤적(프론트엔드 → 빌드 → 테스트 → AI)을
 * 한 화면에서 드러내고, 검색·AI 크롤러가 주제 권위를 판단할 근거를 제공한다.
 */
export default function StudySection({ locale }: StudySectionProps) {
  return (
    <section id="study" aria-labelledby="study-heading" className="py-20 scroll-mt-28">
      <h2
        id="study-heading"
        className="text-4xl font-bold tracking-tight mb-4 animate-fade-in-up"
        style={{ letterSpacing: '-0.03em' }}
      >
        {t(locale, 'study.title')}
      </h2>

      <p className="text-[#86868b] mb-4 animate-fade-in-up stagger-1 max-w-3xl leading-relaxed">
        {t(locale, 'study.subtitle', {
          since: blogStats.since,
          articles: blogStats.articles,
          documents: blogStats.documents,
          links: studyLinkCount,
        })}
      </p>

      <a
        href={blogHomeUrl(locale)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline mb-10 animate-fade-in-up stagger-1"
      >
        {t(locale, 'study.visitBlog')}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 17 17 7M7 7h10v10" />
        </svg>
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {studyGroups.map((group, i) => {
          const anchorId = `study-${group.id}`;
          const groupBase = `study.groups.${group.id}`;
          const label = t(locale, `${groupBase}.label`);

          return (
            <article
              key={group.id}
              id={anchorId}
              className={`apple-surface p-6 scroll-mt-32 group animate-fade-in-up stagger-${Math.min(i + 2, 6)}`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <h3 className="text-base font-bold tracking-tight">{label}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#86868b]">{group.links.length}</span>
                  <AnchorLink
                    href={`#${anchorId}`}
                    label={`${label} ${t(locale, 'career.anchorLabel')}`}
                  />
                </div>
              </div>
              <ul className="flex flex-wrap gap-x-2 gap-y-1.5">
                {group.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={blogPostUrl(locale, link.blogSlug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-2.5 py-1 rounded-full text-xs bg-[var(--surface-secondary)] text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[var(--accent)] hover:bg-[var(--border)] transition-colors"
                    >
                      {t(locale, `${groupBase}.links.${link.id}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

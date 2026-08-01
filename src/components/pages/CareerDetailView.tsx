import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { careers, getCareerDetail } from '@/helpers';
import { t, tList, hasTranslation } from '@/lib/i18n/t';
import { localizedPath, type Locale } from '@/lib/i18n/constants';
import { blogPostUrl } from '@/lib/blog';
import SkillBadge from '@/components/ui/SkillBadge';
import AnchorLink from '@/components/ui/AnchorLink';
import { JsonLd, buildCareerGraph } from '@/lib/seo';

interface CareerDetailViewProps {
  locale: Locale;
  slug: string;
}

/**
 * 경력 상세 본문 (한국어 `/career/[slug]`, 영어 `/en/career/[slug]` 공용).
 * 모든 문구는 i18n에서 읽으므로 로케일만 바꾸면 그대로 영어 페이지가 된다.
 */
export function CareerDetailView({ locale, slug }: CareerDetailViewProps) {
  const career = getCareerDetail(slug);

  if (!career) {
    notFound();
  }

  const base = `career.companies.${slug}`;
  const name = t(locale, `${base}.title`);
  const others = careers.filter((company) => company.slug !== slug);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
      <JsonLd schema={buildCareerGraph(career, locale)} />

      {/* Breadcrumb */}
      <nav aria-label={t(locale, 'career.breadcrumb')} className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <li>
            <Link href={localizedPath(locale, '/')} className="hover:text-[var(--foreground)] transition-colors">
              {t(locale, 'nav.home')}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={localizedPath(locale, '/#career')} className="hover:text-[var(--foreground)] transition-colors">
              {t(locale, 'career.title')}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-[var(--foreground)] font-medium">
            {name}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="animate-fade-in-up mb-12">
        <div className="flex items-start gap-5 mb-6">
          <div className="shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-[var(--surface-secondary)] flex items-center justify-center">
            <Image
              src={career.logo}
              alt={t(locale, `${base}.logoAlt`)}
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ letterSpacing: '-0.03em' }}
            >
              {name}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1.5">
              {t(locale, `${base}.role`)} · {career.period}
            </p>
          </div>
        </div>

        {/* 답변 우선(answer-first) — 요약을 본문 최상단에 배치한다 */}
        <p className="text-lg text-[#424245] dark:text-[#a1a1a6] leading-relaxed max-w-3xl">
          {t(locale, `${base}.summary`)}
        </p>

        <div className="mt-6">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2.5">
            {t(locale, 'career.techStack')}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {career.techStack.map((tech) => (
              <SkillBadge key={tech} label={tech} />
            ))}
          </div>
        </div>
      </header>

      {/* 기술내용 */}
      <section aria-labelledby="tech-heading" className="mb-16">
        <h2
          id="tech-heading"
          className="text-2xl font-bold tracking-tight mb-8"
          style={{ letterSpacing: '-0.02em' }}
        >
          {t(locale, 'career.section.technical')}
        </h2>

        <div className="space-y-6">
          {career.items.map((item) => {
            const itemBase = `${base}.items.${item.id}`;
            const title = t(locale, `${itemBase}.title`);
            const imageAlts = tList(locale, `${itemBase}.imageAlts`);
            // 기술블로그 글은 화면 로케일에 맞는 번역본으로 연결한다
            const referenceUrl = item.blogSlug ? blogPostUrl(locale, item.blogSlug) : item.link;

            return (
              <article
                key={item.id}
                id={item.id}
                className="apple-surface p-7 sm:p-8 scroll-mt-20 group"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="text-lg font-bold tracking-tight">{title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[var(--text-muted)]">{item.date}</span>
                    <AnchorLink
                      href={`#${item.id}`}
                      label={`${title} ${t(locale, 'career.anchorLabel')}`}
                    />
                  </div>
                </div>

                {item.images && item.images.length > 0 && (
                  <div className="flex gap-3 mb-5 flex-wrap">
                    {item.images.map((src, index) => (
                      <div
                        key={src}
                        className="rounded-xl overflow-hidden border border-[var(--border)]"
                      >
                        <Image
                          src={src}
                          alt={imageAlts[index] ?? title}
                          width={220}
                          height={138}
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <ul className="space-y-2">
                  {tList(locale, `${itemBase}.points`).map((point, index) => (
                    <li
                      key={index}
                      className="text-sm text-[#424245] dark:text-[#a1a1a6] leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-[var(--text-muted)]"
                    >
                      {point}
                    </li>
                  ))}
                </ul>

                {(item.meta?.length || referenceUrl) && (
                  <dl className="mt-5 pt-4 border-t border-[var(--border)] space-y-2">
                    {item.meta?.map((meta) => (
                      <div key={meta.labelKey} className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        <dt className="font-semibold uppercase tracking-wider text-[var(--text-muted)] min-w-16">
                          {t(locale, `career.labels.${meta.labelKey}`)}
                        </dt>
                        <dd className="text-[#6e6e73] dark:text-[#a1a1a6] flex-1 min-w-0">
                          {meta.value}
                        </dd>
                      </div>
                    ))}
                    {referenceUrl && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        <dt className="font-semibold uppercase tracking-wider text-[var(--text-muted)] min-w-16">
                          {t(locale, 'career.labels.url')}
                        </dt>
                        <dd className="text-[#6e6e73] dark:text-[#a1a1a6] flex-1 min-w-0">
                          <a
                            href={referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent)] hover:underline break-all"
                          >
                            {hasTranslation(locale, `${itemBase}.linkTitle`)
                              ? t(locale, `${itemBase}.linkTitle`)
                              : referenceUrl}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* 업무내용 */}
      {career.works && career.works.length > 0 && (
        <section aria-labelledby="work-heading" className="mb-16">
          <h2
            id="work-heading"
            className="text-2xl font-bold tracking-tight mb-8"
            style={{ letterSpacing: '-0.02em' }}
          >
            {t(locale, 'career.section.work')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {career.works.map((work) => {
              const workBase = `${base}.works.${work.id}`;
              const title = t(locale, `${workBase}.title`);

              return (
                <article
                  key={work.id}
                  id={work.id}
                  className="apple-surface p-6 scroll-mt-20 group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-base font-bold tracking-tight">{title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {work.period && <span className="text-xs text-[var(--text-muted)]">{work.period}</span>}
                      <AnchorLink
                        href={`#${work.id}`}
                        label={`${title} ${t(locale, 'career.anchorLabel')}`}
                      />
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {tList(locale, `${workBase}.points`).map((point, index) => (
                      <li
                        key={index}
                        className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-[var(--text-muted)]"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* 다른 경력 — 내부 링크로 주제 클러스터를 연결한다 */}
      <nav aria-labelledby="related-heading" className="border-t border-[var(--border)] pt-10">
        <h2
          id="related-heading"
          className="text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-5"
        >
          {t(locale, 'career.related')}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {others.map((company) => (
            <li key={company.slug}>
              <Link
                href={localizedPath(locale, `/career/${company.slug}`)}
                className="apple-surface flex items-center gap-3 p-4 hover:bg-[var(--surface-secondary)] transition-colors duration-200"
              >
                <span className="shrink-0 w-9 h-9 rounded-xl overflow-hidden bg-[var(--surface-secondary)] flex items-center justify-center">
                  <Image
                    src={company.logo}
                    alt=""
                    width={36}
                    height={36}
                    className="object-contain"
                    aria-hidden
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold truncate">
                    {t(locale, `career.companies.${company.slug}.title`)}
                  </span>
                  <span className="block text-xs text-[var(--text-muted)]">{company.period}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

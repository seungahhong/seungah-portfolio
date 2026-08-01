import Image from 'next/image';
import type { Locale } from '@/lib/i18n/constants';
import { t, tList } from '@/lib/i18n/t';
import { blogStats, careers, experienceYears, profileData } from '@/helpers';
import SkillBadge from '@/components/ui/SkillBadge';
import { blogHomeUrl } from '@/lib/blog';

interface AboutSectionProps {
  locale: Locale;
}

export default function AboutSection({ locale }: AboutSectionProps) {
  const name = t(locale, 'profile.name');
  const role = t(locale, 'profile.role');

  /** GEO 원칙 — 구체 수치를 상단에 노출해 AI 검색이 인용할 근거를 만든다 */
  const stats = [
    {
      value: `${experienceYears}${t(locale, 'about.stats.yearsUnit')}`,
      label: t(locale, 'about.stats.years'),
    },
    { value: `${careers.length}`, label: t(locale, 'about.stats.companies') },
    { value: `${blogStats.articles}`, label: t(locale, 'about.stats.articles') },
  ];

  return (
    <section id="about" aria-labelledby="about-heading" className="pt-16 pb-16 scroll-mt-28">
      {/* Hero */}
      <div className="animate-fade-in-up mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/*
            프로필 사진은 어떤 뷰포트에서도 정원을 유지해야 한다.
            flex 컨테이너 안에서 늘어나거나 찌그러지지 않도록 shrink-0 + 고정 크기 + aspect-square를 함께 건다.
          */}
          <div className="shrink-0 w-[7.5rem] h-[7.5rem] sm:w-36 sm:h-36 aspect-square rounded-full overflow-hidden shadow-lg">
            <Image
              src="/profile_logo.webp"
              alt={`${name} ${t(locale, 'profile.photoAlt')}`}
              width={144}
              height={144}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <h1
              id="about-heading"
              className="text-5xl sm:text-6xl font-bold tracking-tight mb-3"
              style={{ letterSpacing: '-0.03em' }}
            >
              {name}
            </h1>
            <p className="text-xl text-[var(--text-muted)] font-medium">{role}</p>
          </div>
        </div>

        {/* 답변 우선(answer-first) — "이 사람은 누구인가"에 대한 결론을 최상단에 둔다 */}
        <p className="mt-8 text-lg text-[#424245] dark:text-[#a1a1a6] max-w-3xl leading-relaxed text-center sm:text-left">
          {t(locale, 'profile.headline')}
        </p>
      </div>

      {/* Stats */}
      <dl className="animate-fade-in-up stagger-1 flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="apple-surface px-6 py-4 text-center min-w-28 flex flex-col"
          >
            {/* 시각적으로는 수치가 먼저 오지만, 마크업은 dt(항목명) → dd(값) 순서를 지킨다 */}
            <dt className="text-xs text-[var(--text-muted)] order-2 mt-1">{stat.label}</dt>
            <dd className="text-2xl font-bold tracking-tight order-1">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {/* Description */}
      <div className="animate-fade-in-up stagger-1 max-w-3xl mb-16 space-y-4">
        {tList(locale, 'about.descriptions').map((description, index) => (
          <p
            key={index}
            className="text-[#424245] dark:text-[#a1a1a6] leading-relaxed text-center sm:text-left"
          >
            {description}
          </p>
        ))}
      </div>

      {/* Skills */}
      <div className="animate-fade-in-up stagger-2 apple-surface p-8 sm:p-10 mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
          {t(locale, 'about.skills')}
        </h2>
        <div className="space-y-5">
          {profileData.skillGroupKeys.map((groupKey) => (
            <div key={groupKey}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
                {t(locale, `about.skillGroups.${groupKey}.label`)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {tList(locale, `about.skillGroups.${groupKey}.items`).map((skill) => (
                  <SkillBadge key={skill} label={skill} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact links */}
      <div className="animate-fade-in-up stagger-3 apple-surface p-8 sm:p-10">
        <h2 className="text-2xl font-bold tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
          {t(locale, 'about.contact')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: `mailto:${profileData.email}`, label: profileData.email, icon: 'email' },
            { href: profileData.github, label: 'GitHub', icon: 'github' },
            { href: blogHomeUrl(locale), label: 'Blog', icon: 'blog' },
            { href: profileData.notion, label: 'Notion', icon: 'notion' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('mailto') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-secondary)] hover:bg-[var(--border)] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center shadow-sm">
                {link.icon === 'email' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                )}
                {link.icon === 'github' && (
                  <Image src="/github.svg" alt="" width={18} height={18} aria-hidden className="opacity-50 group-hover:opacity-100 transition-opacity" />
                )}
                {link.icon === 'blog' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" aria-hidden="true">
                    <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
                  </svg>
                )}
                {link.icon === 'notion' && (
                  <Image src="/notion.svg" alt="" width={18} height={18} aria-hidden className="opacity-50 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <span className="text-sm font-medium text-[#424245] dark:text-[#a1a1a6] group-hover:text-[var(--foreground)] transition-colors truncate">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

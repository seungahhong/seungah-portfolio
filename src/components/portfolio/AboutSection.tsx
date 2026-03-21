import Image from 'next/image';
import { t } from '@/lib/i18n/t';
import { profileData } from '@/helpers';
import SkillBadge from '@/components/ui/SkillBadge';

interface AboutSectionProps {
  locale: string;
}

export default function AboutSection({ locale }: AboutSectionProps) {
  const name = locale === 'ko' ? profileData.name.ko : profileData.name.en;
  const role = locale === 'ko' ? profileData.role.ko : profileData.role.en;

  return (
    <section id="about" aria-labelledby="about-heading" className="pt-20 pb-16">
      {/* Hero */}
      <div className="animate-fade-in-up text-center mb-16">
        <div className="mb-6">
          <Image
            src="/profile_logo.webp"
            alt={`${name} profile photo`}
            width={120}
            height={120}
            className="rounded-full object-cover mx-auto shadow-lg"
            priority
          />
        </div>
        <h1
          id="about-heading"
          className="text-5xl sm:text-6xl font-bold tracking-tight mb-3"
          style={{ letterSpacing: '-0.03em' }}
        >
          {name}
        </h1>
        <p className="text-xl text-[#86868b] font-medium mb-6">{role}</p>
        <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6] max-w-xl mx-auto leading-relaxed">
          {t(locale, 'about.intro')}
        </p>
      </div>

      {/* Description */}
      <div className="animate-fade-in-up stagger-1 max-w-2xl mx-auto mb-16 space-y-4">
        {['about.description.1', 'about.description.2', 'about.description.3'].map((key) => (
          <p key={key} className="text-[#424245] dark:text-[#a1a1a6] leading-relaxed text-center">
            {t(locale, key)}
          </p>
        ))}
      </div>

      {/* Skills */}
      <div className="animate-fade-in-up stagger-2 apple-surface p-8 sm:p-10 mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
          {t(locale, 'about.skills')}
        </h2>
        <div className="space-y-5">
          {profileData.skills.map((skillGroup) => (
            <div key={skillGroup.category}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#86868b] mb-3">
                {skillGroup.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((skill) => (
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
            { href: profileData.blog, label: 'Blog', icon: 'blog' },
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#86868b] group-hover:text-[var(--accent)] transition-colors" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                )}
                {link.icon === 'github' && (
                  <Image src="/github.svg" alt="" width={18} height={18} aria-hidden className="opacity-50 group-hover:opacity-100 transition-opacity" />
                )}
                {link.icon === 'blog' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#86868b] group-hover:text-[var(--accent)] transition-colors" aria-hidden="true">
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

'use client';

import { useT } from '@/lib/i18n/useT';
import { profileData } from '@/helpers';
import SkillBadge from '@/components/ui/SkillBadge';

export function ProfileResponseCard() {
  const { t, locale } = useT();
  const name = locale === 'ko' ? profileData.name.ko : profileData.name.en;
  const role = locale === 'ko' ? profileData.role.ko : profileData.role.en;

  return (
    <div className="apple-surface p-6 mt-2 mb-2 animate-fade-in-up">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--surface-secondary)] flex items-center justify-center text-lg font-bold text-[#86868b]">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-base font-bold tracking-tight text-[var(--foreground)]">{name}</p>
          <p className="text-sm text-[#86868b]">{role}</p>
        </div>
      </div>

      {/* Contact links */}
      <div className="flex flex-wrap gap-3 mb-5">
        <a
          href={`mailto:${profileData.email}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[var(--accent)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          {profileData.email}
        </a>
        <a
          href={profileData.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[var(--accent)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          GitHub
        </a>
        <a
          href={profileData.blog}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[var(--accent)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
          </svg>
          Blog
        </a>
      </div>

      {/* Skills */}
      <div className="space-y-3 border-t border-[var(--border)] pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#86868b]">
          {t('about.skills')}
        </p>
        {profileData.skills.map((group) => (
          <div key={group.category}>
            <p className="text-[10px] uppercase tracking-wide text-[#86868b] mb-1.5">
              {group.category}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((skill) => (
                <SkillBadge key={skill} label={skill} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

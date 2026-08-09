import Image from 'next/image';
import Link from 'next/link';
import { t } from '@/lib/i18n/t';
import { localizedPath, type Locale } from '@/lib/i18n/constants';
import type { ICareerDetail } from '@/types';
import SkillBadge from '@/components/ui/SkillBadge';

interface CareerCardProps {
  career: ICareerDetail;
  locale: Locale;
}

/** 카드에서 미리 보여줄 대표 항목 수 — 나머지는 상세 페이지로 연결한다 */
const PREVIEW_ITEM_COUNT = 4;

export default function CareerCard({ career, locale }: CareerCardProps) {
  const { slug } = career;
  const base = `career.companies.${slug}` as const;
  const detailHref = localizedPath(locale, `/career/${slug}`);
  const techStack = career.techStack.slice(0, 8);
  const previewItems = career.items.slice(0, PREVIEW_ITEM_COUNT);
  const remainingCount = career.items.length - previewItems.length;

  return (
    <article
      id={`career-${slug}`}
      className="apple-surface p-7 sm:p-8 flex flex-col h-full scroll-mt-32"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="shrink-0 w-12 h-12 rounded-2xl overflow-hidden bg-[var(--surface-secondary)] flex items-center justify-center">
          <Image
            src={career.logo}
            alt={t(locale, `${base}.logoAlt`)}
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold tracking-tight">
            <Link href={detailHref} className="hover:text-[var(--accent)] transition-colors">
              {t(locale, `${base}.title`)}
            </Link>
          </h3>
          <p className="text-sm text-[var(--text-muted)]">{t(locale, `${base}.role`)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{career.period}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#424245] dark:text-[#a1a1a6] mb-5 leading-relaxed">
        {t(locale, `${base}.description`)}
      </p>

      {/* Tech stack */}
      {techStack.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
            {t(locale, 'career.techStack')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {techStack.map((tech) => (
              <SkillBadge key={tech} label={tech} />
            ))}
          </div>
        </div>
      )}

      {/* 대표 항목 — 각 항목은 상세 페이지의 해시 앵커로 직접 연결된다 */}
      {previewItems.length > 0 && (
        <div className="flex-1 mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
            {t(locale, 'career.highlights')}
          </p>
          <ul className="space-y-1.5">
            {previewItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`${detailHref}#${item.id}`}
                  className="block text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[var(--accent)] transition-colors leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-[var(--text-muted)]"
                >
                  {t(locale, `${base}.items.${item.id}.title`)}
                </Link>
              </li>
            ))}
          </ul>
          {remainingCount > 0 && (
            <p className="text-xs text-[var(--text-muted)] mt-2 pl-4">
              {t(locale, 'career.more', { count: remainingCount })}
            </p>
          )}
        </div>
      )}

      {/* 상세 페이지 */}
      <Link
        href={detailHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline border-t border-[var(--border)] pt-4 mt-auto"
      >
        {t(locale, 'career.details')}
        <svg
          width="14"
          height="14"
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
    </article>
  );
}

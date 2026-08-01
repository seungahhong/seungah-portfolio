'use client';

import { useT } from '../../lib/i18n/useT';
import { t as translate } from '../../lib/i18n/t';

interface SuggestionChipsProps {
  /** 서버가 결정한 로케일 — 없으면 컨텍스트 로케일을 쓴다 */
  locale?: string;
  onSelect: (message: string) => void;
}

const CHIP_KEYS = [
  'chat.chips.wadiz',
  'chat.chips.hancom',
  'chat.chips.skills',
  'chat.chips.process',
  'chat.chips.test',
  'chat.chips.performance',
] as const;

export function SuggestionChips({ onSelect, locale }: SuggestionChipsProps) {
  const { t: tContext } = useT();
  const t = (key: string) => (locale ? translate(locale, key) : tContext(key));

  return (
    <div className="px-2">
      <p className="text-xs font-medium text-[var(--text-muted)] mb-4 text-center">
        {t('chat.welcome')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CHIP_KEYS.map((key, i) => (
          <button
            key={key}
            onClick={() => onSelect(t(key))}
            className={[
              `text-left text-sm px-5 py-4 animate-fade-in-up stagger-${i + 1}`,
              'apple-surface',
              'text-[#424245] dark:text-[#a1a1a6]',
              'hover:border-[var(--accent)] hover:text-[var(--accent)]',
              'transition-all duration-200',
              'leading-snug',
            ].join(' ')}
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  );
}

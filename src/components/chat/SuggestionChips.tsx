'use client';

import { useT } from '../../lib/i18n/useT';

interface SuggestionChipsProps {
  onSelect: (message: string) => void;
}

const CHIP_KEYS = [
  'chat.chip.wadiz',
  'chat.chip.hancom',
  'chat.chip.skills',
  'chat.chip.process',
  'chat.chip.test',
  'chat.chip.performance',
] as const;

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  const { t } = useT();

  return (
    <div className="px-2">
      <p className="text-xs font-medium text-[#86868b] mb-4 text-center">
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

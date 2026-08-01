'use client';

import { useRef, KeyboardEvent, ChangeEvent } from 'react';
import { useT } from '../../lib/i18n/useT';
import { t as translate } from '../../lib/i18n/t';

interface ChatInputProps {
  /** 서버가 결정한 로케일 — 없으면 컨텍스트 로케일을 쓴다 */
  locale?: string;
  onSend: (message: string) => void;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function ChatInput({ onSend, disabled, value, onChange, locale }: ChatInputProps) {
  const { t: tContext } = useT();
  const t = (key: string) => (locale ? translate(locale, key) : tContext(key));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function adjustHeight() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * 4 + 16;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    adjustHeight();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    onChange('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  return (
    <div className="apple-surface p-2 flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={t('chat.placeholder')}
        rows={1}
        className={[
          'flex-1 resize-none rounded-xl px-4 py-3 text-sm leading-6',
          'bg-[var(--surface-secondary)]',
          'border border-[var(--border)]',
          'text-[var(--foreground)]',
          'placeholder:text-[#86868b]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-200',
        ].join(' ')}
        style={{ minHeight: '44px', maxHeight: '112px', overflowY: 'auto' }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label={t('chat.send')}
        className={[
          'flex-shrink-0 w-11 h-11 rounded-xl',
          'flex items-center justify-center',
          'bg-[var(--accent)] hover:bg-[var(--accent-hover)]',
          'text-white',
          'transition-all duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'active:scale-[0.95]',
        ].join(' ')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 19V5M5 12l7-7 7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

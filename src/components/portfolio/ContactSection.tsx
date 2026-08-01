'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n/constants';
import { t as translate } from '@/lib/i18n/t';
import { profileData } from '@/helpers';

const validateForm = (
  form: { name: string; email: string; message: string },
  tFn: (key: string) => string
): string[] => {
  const errors: string[] = [];
  if (!form.name.trim()) errors.push(tFn('contact.validation.name'));
  if (!form.email.trim()) {
    errors.push(tFn('contact.validation.email'));
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.push(tFn('contact.validation.emailFormat'));
  }
  if (!form.message.trim()) {
    errors.push(tFn('contact.validation.message'));
  } else if (form.message.length < 10) {
    errors.push(tFn('contact.validation.messageLength'));
  }
  return errors;
};

interface ContactSectionProps {
  /**
   * 서버가 결정한 로케일.
   * 클라이언트 컴포넌트지만 서버 렌더링 시점에도 올바른 언어가 나오도록 prop으로 받는다
   * (컨텍스트만 쓰면 하이드레이션 전까지 기본 로케일로 렌더링되어 언어가 섞인다).
   */
  locale: Locale;
}

export default function ContactSection({ locale }: ContactSectionProps) {
  const t = (key: string) => translate(locale, key);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; isFallback?: boolean } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (errors.length > 0) setErrors(validateForm(updated, t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form, t);
    if (validationErrors.length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    setResult(null);
    setErrors([]);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setResult({ text: t('contact.success') });
        setForm({ name: '', email: '', message: '' });
      } else if (res.status === 503) {
        setResult({ text: t('contact.error'), isFallback: true });
      } else {
        setResult({ text: t('contact.error') });
      }
    } catch {
      setResult({ text: t('contact.networkError'), isFallback: true });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = [
    'w-full px-4 py-3 rounded-xl text-sm',
    'bg-[var(--surface-secondary)] border border-[var(--border)]',
    'text-[var(--foreground)]',
    'placeholder:text-[#86868b]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
    'transition-all duration-200',
  ].join(' ');

  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-20 scroll-mt-28">
      <h2
        id="contact-heading"
        className="text-4xl font-bold tracking-tight mb-4 animate-fade-in-up"
        style={{ letterSpacing: '-0.03em' }}
      >
        {t('contact.title')}
      </h2>
      <p className="text-[#86868b] mb-12 animate-fade-in-up stagger-1">
        {t('contact.subtitle')}
      </p>

      <div className="max-w-xl animate-fade-in-up stagger-2">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="apple-surface p-8 sm:p-10 flex flex-col gap-5"
        >
          <div>
            <label htmlFor="contact-name" className="block text-sm font-semibold mb-2">
              {t('contact.name')}
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder={t('contact.namePlaceholder')}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-sm font-semibold mb-2">
              {t('contact.email')}
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder={t('contact.emailPlaceholder')}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-semibold mb-2">
              {t('contact.message')}
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder={t('contact.messagePlaceholder')}
              className={`${inputClass} resize-none`}
            />
          </div>

          {errors.length > 0 && (
            <div role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4">
              <ul className="text-red-600 dark:text-red-400 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>· {error}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? t('contact.sending') : t('contact.submit')}
          </button>

          {result && (
            <div role="status" className="text-center text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
              <p>{result.text}</p>
              {result.isFallback && (
                <a
                  href={`mailto:${profileData.email}`}
                  className="inline-block mt-2 text-[var(--accent)] font-medium hover:underline"
                >
                  {t('contact.fallback')}
                </a>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

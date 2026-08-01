import type { Locale } from '@/lib/i18n/constants';
import { t } from '@/lib/i18n/t';
import { faqIds, faqParams } from '@/helpers';
import AnchorLink from '@/components/ui/AnchorLink';

interface FaqSectionProps {
  locale: Locale;
}

/**
 * 자주 묻는 질문.
 *
 * 문구는 i18n(`faq.items.{id}`), 수치는 `faqParams()`에서 온다 — 화면과 FAQPage JSON-LD가
 * 같은 출처를 쓰므로 내용이 어긋날 수 없다.
 * 답변 본문은 접힘 여부와 무관하게 항상 DOM에 존재하므로 크롤러가 그대로 추출할 수 있다.
 */
export default function FaqSection({ locale }: FaqSectionProps) {
  const params = faqParams();

  return (
    <section id="faq" aria-labelledby="faq-heading" className="py-20 scroll-mt-28">
      <h2
        id="faq-heading"
        className="text-4xl font-bold tracking-tight mb-4 animate-fade-in-up"
        style={{ letterSpacing: '-0.03em' }}
      >
        {t(locale, 'faq.title')}
      </h2>
      <p className="text-[#86868b] mb-12 animate-fade-in-up stagger-1">
        {t(locale, 'faq.subtitle')}
      </p>

      <div className="space-y-3">
        {faqIds.map((id, index) => {
          const anchorId = `faq-${id}`;
          const question = t(locale, `faq.items.${id}.question`);

          return (
            <div
              key={id}
              id={anchorId}
              className="apple-surface relative scroll-mt-32 group animate-fade-in-up"
            >
              {/*
                딥링크는 <summary> 바깥에 둔다.
                summary 안에 넣으면 접근성 이름이 내용에서 계산되면서 질문 문구가 중복으로 읽힌다.
              */}
              <div className="absolute top-5 right-6 z-10">
                <AnchorLink href={`#${anchorId}`} label={question} />
              </div>

              <details open={index === 0} className="px-6 py-5 group/details">
                <summary className="flex items-center justify-between gap-3 pr-12 cursor-pointer list-none select-none">
                  <h3 className="text-base font-semibold tracking-tight">{question}</h3>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-[#86868b] transition-transform duration-200 group-open/details:rotate-90"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-[#424245] dark:text-[#a1a1a6] leading-relaxed">
                  {t(locale, `faq.items.${id}.answer`, params)}
                </p>
              </details>
            </div>
          );
        })}
      </div>
    </section>
  );
}

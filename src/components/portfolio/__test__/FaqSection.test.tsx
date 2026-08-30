import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FaqSection from '../FaqSection';
import { faqIds, faqParams } from '@/helpers';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/** API 경계: 네트워크 호출 없음. 서버 컴포넌트이며 데이터·i18n만 읽는다. */

const renderFaq = (locale: Locale = 'ko') => render(<FaqSection locale={locale} />);

describe('FaqSection — 크롤러가 답변을 추출할 수 있어야 한다 (GEO)', () => {
  it('[AC-26.1] 접힘 여부와 무관하게 모든 답변 본문이 DOM에 있다', () => {
    // FAQPage는 AI 검색이 가장 많이 인용하는 구조다. 조건부 렌더링이면 답변이 통째로 사라진다.
    renderFaq();
    const params = faqParams();
    for (const id of faqIds) {
      expect(screen.getByText(t('ko', `faq.items.${id}.answer`, params))).toBeInTheDocument();
    }
  });

  it('[AC-26.2] 첫 항목만 펼쳐진 상태로 시작한다', () => {
    const { container } = renderFaq();
    const details = [...container.querySelectorAll('details')];

    expect(details).toHaveLength(faqIds.length);
    expect(details[0].open).toBe(true);
    expect(details.slice(1).every((element) => element.open === false)).toBe(true);
  });

  it('[AC-26.3] 답변 문구에 치환되지 않은 자리표시자가 남지 않는다', () => {
    // 수치를 문자열에 직접 쓰지 않고 {years} 같은 자리표시자로 두기 때문에,
    // faqParams()에 항목을 빠뜨리면 화면에 중괄호가 그대로 노출된다.
    renderFaq();
    const params = faqParams();
    for (const id of faqIds) {
      expect(t('ko', `faq.items.${id}.answer`, params)).not.toMatch(/[{}]/);
    }
  });
});

describe('FaqSection — 접근성', () => {
  it('[AC-26.4] 딥링크 앵커는 summary 바깥에 있다', () => {
    // summary의 접근성 이름은 내용에서 계산된다 — 안에 링크를 두면 질문에 링크 텍스트가 섞여 중복으로 읽힌다
    const { container } = renderFaq();
    const anchors = [...container.querySelectorAll('a[href^="#faq-"]')];

    expect(anchors.length).toBe(faqIds.length);
    for (const anchor of anchors) {
      expect(anchor.closest('summary')).toBeNull();
    }
  });

  it('[AC-26.5] 각 질문이 자기 앵커 id를 갖는다 (딥링크가 성립한다)', () => {
    const { container } = renderFaq();
    for (const id of faqIds) {
      expect(container.querySelector(`#faq-${id}`)).not.toBeNull();
    }
  });
});

describe('FaqSection — 로케일', () => {
  it('[AC-26.6] 영어 화면은 영어 질문을 보여준다', () => {
    renderFaq('en');
    for (const id of faqIds) {
      expect(
        screen.getByRole('heading', { name: t('en', `faq.items.${id}.question`) })
      ).toBeInTheDocument();
    }
  });
});

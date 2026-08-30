'use client';
// SuggestionChips는 'use client' 모듈이다 — arch-guard R2 대응(vitest에서는 no-op).

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestionChips } from '../SuggestionChips';
import { I18nProvider } from '@/lib/i18n/provider';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/** API 경계: 네트워크 호출 없음. 칩은 선택 결과를 부모(onSelect)에게 넘길 뿐이다. */

const CHIP_KEYS = [
  'chat.chips.wadiz',
  'chat.chips.hancom',
  'chat.chips.skills',
  'chat.chips.process',
  'chat.chips.test',
  'chat.chips.performance',
] as const;

function renderChips(onSelect = vi.fn(), locale: Locale = 'ko') {
  render(
    <I18nProvider locale={locale}>
      <SuggestionChips onSelect={onSelect} locale={locale} />
    </I18nProvider>
  );
  return onSelect;
}

describe('SuggestionChips — 표시', () => {
  it('[AC-22.1] 여섯 개의 제안 칩을 모두 렌더한다', () => {
    renderChips();
    expect(screen.getAllByRole('button')).toHaveLength(CHIP_KEYS.length);
    for (const key of CHIP_KEYS) {
      expect(screen.getByRole('button', { name: t('ko', key) })).toBeInTheDocument();
    }
  });

  it('[AC-22.2] locale prop이 칩 문구의 언어를 결정한다', () => {
    renderChips(vi.fn(), 'en');
    for (const key of CHIP_KEYS) {
      expect(screen.getByRole('button', { name: t('en', key) })).toBeInTheDocument();
    }
  });
});

describe('SuggestionChips — 선택', () => {
  it('[AC-22.3] 칩을 고르면 키가 아니라 번역된 문장이 전달된다', async () => {
    const user = userEvent.setup();
    const onSelect = renderChips();

    await user.click(screen.getByRole('button', { name: t('ko', 'chat.chips.wadiz') }));

    // 그대로 챗 입력이 되는 값이다 — 키가 새어 나가면 사용자가 'chat.chips.wadiz'를 질문하게 된다
    expect(onSelect).toHaveBeenCalledWith(t('ko', 'chat.chips.wadiz'));
    expect(onSelect).not.toHaveBeenCalledWith('chat.chips.wadiz');
  });

  it('[AC-22.4] 영어 화면에서는 영어 문장이 전달된다', async () => {
    const user = userEvent.setup();
    const onSelect = renderChips(vi.fn(), 'en');

    await user.click(screen.getByRole('button', { name: t('en', 'chat.chips.skills') }));

    expect(onSelect).toHaveBeenCalledWith(t('en', 'chat.chips.skills'));
  });
});

describe('SuggestionChips — 애니메이션 클래스', () => {
  it('[AC-22.5] stagger 클래스가 실재하는 1~6 범위 안에 있다', () => {
    // Tailwind는 동적 클래스명을 생성하지 못한다. stagger-7이 나오면 그 칩만 조용히 안 나타난다.
    renderChips();
    for (const button of screen.getAllByRole('button')) {
      const stagger = [...button.classList].find((name) => name.startsWith('stagger-'));
      expect(stagger).toBeDefined();
      expect(Number(stagger!.replace('stagger-', ''))).toBeLessThanOrEqual(6);
      expect(Number(stagger!.replace('stagger-', ''))).toBeGreaterThanOrEqual(1);
    }
  });
});

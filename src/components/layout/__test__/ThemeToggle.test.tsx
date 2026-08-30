'use client';
// ThemeToggle은 'use client' 모듈이다 — arch-guard R2 대응(vitest에서는 no-op).

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '../ThemeToggle';
import { I18nProvider } from '@/lib/i18n/provider';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/**
 * API 경계: 네트워크 호출 없음. jsdom 미구현 matchMedia만 스텁한다.
 * 검증 범위 밖 — 실제 OS 테마 질의, 새로고침 후 유지(e2e [AC-4.2]가 브라우저에서 본다),
 * 그리고 하이드레이션 불일치 여부(서버/클라이언트 두 렌더를 대조해야 드러난다).
 */
beforeAll(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }));
});

function renderToggle(defaultTheme: 'light' | 'dark', locale: Locale = 'ko') {
  render(
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem={false}>
      <I18nProvider locale={locale}>
        <ThemeToggle />
      </I18nProvider>
    </ThemeProvider>
  );
  return screen.getByRole('button', { name: t(locale, 'theme.toggle') });
}

beforeEach(() => {
  // 이 환경의 jsdom localStorage는 clear()를 제공하지 않는다(러너의 --localstorage-file 경고와 같은 원인).
  // next-themes가 남긴 키만 지운다.
  try {
    window.localStorage.removeItem('theme');
  } catch {
    /* localStorage를 못 쓰는 환경이면 next-themes도 기본값으로 동작한다 */
  }
  document.documentElement.className = '';
});

describe('ThemeToggle — 전환', () => {
  it('[AC-20.1] 다크에서 누르면 라이트가 된다', async () => {
    const user = userEvent.setup();
    const button = renderToggle('dark');

    await user.click(button);

    // 토큰(--surface 등)을 가르는 것은 <html>의 클래스다
    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('[AC-20.2] 라이트에서 누르면 다크가 된다', async () => {
    const user = userEvent.setup();
    const button = renderToggle('light');

    await user.click(button);

    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('light');
  });

  it('[AC-20.3] 두 번 누르면 원래 테마로 돌아온다', async () => {
    const user = userEvent.setup();
    const button = renderToggle('light');

    await user.click(button);
    await user.click(button);

    expect(document.documentElement).toHaveClass('light');
  });
});

describe('ThemeToggle — 접근성과 로케일', () => {
  it('[AC-20.4] 아이콘만 있는 버튼이므로 접근 가능한 이름을 갖는다', () => {
    // 아이콘은 장식이고 이름은 aria-label에서 온다 — 없으면 스크린리더에 "버튼"으로만 읽힌다
    expect(renderToggle('light')).toHaveAccessibleName(t('ko', 'theme.toggle'));
  });

  it('[AC-20.5] 영어 화면에서는 영어 이름을 갖는다', () => {
    expect(renderToggle('light', 'en')).toHaveAccessibleName(t('en', 'theme.toggle'));
  });
});

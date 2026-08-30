'use client';
// ChatTab은 'use client' 모듈이다 — arch-guard R2 대응(vitest에서는 no-op).

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ChatTab } from '../ChatTab';
import { I18nProvider } from '@/lib/i18n/provider';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/**
 * API 경계: mock · ① 네트워크 인터셉터(MSW). 실제 Groq로 나가지 않는다.
 * fixture 출처와 한계는 ./fixtures/README.md 참고 — ① 내부 라우트 계약(실측 근거 있음).
 */
import available from './fixtures/chat.get.200.available-true.json';
import unavailable from './fixtures/chat.get.200.available-false.json';

const CHAT_ENDPOINT = new URL('/api/chat', window.location.origin).toString();

const server = setupServer();
/** 가용성 조회가 실제로 끝났는지 세어 둔다 — "아직 응답 전이라 통과"라는 가짜 초록을 막는다 */
let mockedResponses = 0;

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  server.events.on('response:mocked', () => {
    mockedResponses += 1;
  });
});
afterEach(() => server.resetHandlers());
afterAll(() => {
  server.events.removeAllListeners();
  server.close();
});
beforeEach(() => {
  mockedResponses = 0;
});

function renderTab(body: { available: boolean }, locale: Locale = 'ko') {
  server.use(http.get(CHAT_ENDPOINT, () => HttpResponse.json(body)));
  render(
    <I18nProvider locale={locale}>
      <ChatTab locale={locale} />
    </I18nProvider>
  );
}

const input = () => screen.getByRole('textbox');
const notice = (locale: Locale = 'ko') => screen.queryByText(t(locale, 'chat.unavailable'));

describe('ChatTab — 자격증명 축소 계약 (ADR 0005)', () => {
  it('[AC-25.1] 챗을 쓸 수 없으면 안내를 띄우고 입력을 막는다', async () => {
    renderTab(unavailable);

    expect(await screen.findByText(t('ko', 'chat.unavailable'))).toBeInTheDocument();
    expect(input()).toBeDisabled();
  });

  it('[AC-25.2] 챗을 쓸 수 있으면 안내 없이 입력이 열린다', async () => {
    renderTab(available);

    await waitFor(() => expect(mockedResponses).toBeGreaterThan(0));
    expect(notice()).not.toBeInTheDocument();
    expect(input()).not.toBeDisabled();
  });

  it('[AC-25.3] 가용성 조회가 실패해도 죽지 않고 비활성으로 떨어진다', async () => {
    // 축소는 예외가 아니다 — 나머지 화면은 그대로 있어야 한다
    server.use(http.get(CHAT_ENDPOINT, () => HttpResponse.error()));
    render(
      <I18nProvider locale="ko">
        <ChatTab locale="ko" />
      </I18nProvider>
    );

    expect(await screen.findByText(t('ko', 'chat.unavailable'))).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: t('ko', 'chat.tab.welcomeTitle') })
    ).toBeInTheDocument();
  });
});

describe('ChatTab — 첫 화면', () => {
  it('[AC-25.4] 대화가 없으면 환영 문구와 제안 칩을 보여준다', async () => {
    renderTab(available);

    expect(
      await screen.findByRole('heading', { name: t('ko', 'chat.tab.welcomeTitle') })
    ).toBeInTheDocument();
    expect(screen.getByText(t('ko', 'chat.tab.welcomeSubtitle'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('ko', 'chat.chips.wadiz') })).toBeInTheDocument();
  });

  it('[AC-25.5] locale prop이 화면 언어를 결정한다', async () => {
    renderTab(available, 'en');

    expect(
      await screen.findByRole('heading', { name: t('en', 'chat.tab.welcomeTitle') })
    ).toBeInTheDocument();
    expect(input()).toHaveAttribute('placeholder', t('en', 'chat.placeholder'));
  });
});

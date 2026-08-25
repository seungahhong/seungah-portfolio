'use client';
// 이 파일은 클라이언트 훅(useChat)을 직접 호출한다.
// 지시어가 없으면 arch-guard R2가 '서버 모듈이 클라이언트 값을 import했다'로 판정한다
// (R2가 막으려는 실제 사고는 Next 런타임에서만 일어나지만, 가드는 파일 단위로 판정한다).
// vitest에서 이 지시어는 무해한 no-op이다.

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { useChat } from '../useChat';
import { I18nProvider } from '@/lib/i18n/provider';
import { t } from '@/lib/i18n/t';

import rateLimited from './fixtures/chat.post.429.json';
import unavailable from './fixtures/chat.post.503.json';
import upstreamError from './fixtures/chat.post.500.json';
import emptyError from './fixtures/chat.post.500-empty.json';

/**
 * API 경계: ① 네트워크 인터셉터(MSW). 실제 API로 나가지 않는다.
 * fixture 출처와 한계는 ./fixtures/README.md 참고 — [스키마 유도, 실측 캡처 아님].
 */
const ENDPOINT = new URL('/api/chat', window.location.origin).toString();

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider locale="ko">{children}</I18nProvider>
);

/** 청크를 순차로 흘려보내는 text/plain 스트림 — 실제 라우트의 성공 응답 형태 */
function streamOf(chunks: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

const jsonOnce = (status: number, body: unknown) =>
  server.use(http.post(ENDPOINT, () => HttpResponse.json(body as Record<string, unknown>, { status })));

describe('useChat — 에러 매핑', () => {
  it('[AC-5.1] 429는 레이트리밋 안내로 매핑한다', async () => {
    jsonOnce(429, rateLimited);
    const { result } = renderHook(() => useChat(), { wrapper });
    await act(async () => { await result.current.sendMessage('안녕'); });
    // fixture의 영문 문구가 아니라 i18n 안내로 바뀌어야 한다 (fixture-as-oracle 금지)
    await waitFor(() => expect(result.current.error).toBe(t('ko', 'chat.rateLimit')));
  });

  it('[AC-5.2] 503은 챗 비활성 안내로 매핑한다', async () => {
    jsonOnce(503, unavailable);
    const { result } = renderHook(() => useChat(), { wrapper });
    await act(async () => { await result.current.sendMessage('안녕'); });
    await waitFor(() => expect(result.current.error).toBe(t('ko', 'chat.unavailable')));
  });

  it('[AC-5.3] 그 외 상태는 서버가 준 메시지를 그대로 전달한다', async () => {
    jsonOnce(500, upstreamError);
    const { result } = renderHook(() => useChat(), { wrapper });
    await act(async () => { await result.current.sendMessage('안녕'); });
    // 문구 자체가 아니라 '패스스루 여부'를 본다 — 값은 센티넬이다.
    await waitFor(() => expect(result.current.error).toBe(upstreamError.error));
  });

  it('[AC-5.4] 서버 메시지가 없으면 기본 오류 안내로 폴백한다', async () => {
    jsonOnce(500, emptyError);
    const { result } = renderHook(() => useChat(), { wrapper });
    await act(async () => { await result.current.sendMessage('안녕'); });
    await waitFor(() => expect(result.current.error).toBe(t('ko', 'chat.error')));
  });

  // 빈 말풍선이 남으면 사용자는 답이 오는 중이라고 오해한다.
  it('[AC-5.5] 실패하면 비어 있는 assistant 말풍선을 남기지 않는다', async () => {
    jsonOnce(503, unavailable);
    const { result } = renderHook(() => useChat(), { wrapper });
    await act(async () => { await result.current.sendMessage('안녕'); });
    await waitFor(() => {
      expect(result.current.messages.some(m => m.role === 'assistant')).toBe(false);
      expect(result.current.isStreaming).toBe(false);
    });
  });
});

describe('useChat — 스트리밍', () => {
  it('[AC-5.6] 청크를 누적해 최종 응답을 만든다', async () => {
    server.use(
      http.post(ENDPOINT, () =>
        new HttpResponse(streamOf(['안녕', '하세', '요']), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      )
    );
    const { result } = renderHook(() => useChat(), { wrapper });
    await act(async () => { await result.current.sendMessage('인사해줘'); });
    await waitFor(() => {
      const assistant = result.current.messages.find(m => m.role === 'assistant');
      expect(assistant?.content).toBe('안녕하세요');
    });
    expect(result.current.isStreaming).toBe(false);
  });
});

describe('useChat — 요청 조립', () => {
  it('[AC-5.7] 히스토리는 직전 대화만 담고 현재 입력을 포함하지 않는다', async () => {
    const bodies: Array<{ message: string; history: Array<{ content: string }>; locale: string }> = [];
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        bodies.push(await request.json() as never);
        return new HttpResponse(streamOf(['ok']), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
    );
    const { result } = renderHook(() => useChat(), { wrapper });
    await act(async () => { await result.current.sendMessage('첫 질문'); });
    await waitFor(() => expect(result.current.isStreaming).toBe(false));
    await act(async () => { await result.current.sendMessage('두 번째 질문'); });
    await waitFor(() => expect(bodies).toHaveLength(2));

    expect(bodies[0].history).toEqual([]);
    expect(bodies[1].message).toBe('두 번째 질문');
    // 현재 입력이 히스토리에 중복으로 들어가면 모델이 같은 질문을 두 번 본다.
    expect(bodies[1].history.map(m => m.content)).not.toContain('두 번째 질문');
    expect(bodies[1].history.map(m => m.content)).toContain('첫 질문');
    expect(bodies[1].locale).toBe('ko');
  });

  // 서버 검증(400) 이전에 클라이언트가 먼저 막는다 — onUnhandledRequest:'error'가 호출 자체를 잡는다.
  it('[AC-5.8] 빈 입력·공백만 있는 입력은 전송하지 않는다', async () => {
    const { result } = renderHook(() => useChat(), { wrapper });
    await act(async () => { await result.current.sendMessage(''); });
    await act(async () => { await result.current.sendMessage('   '); });
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });
});

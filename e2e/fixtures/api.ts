import type { Page } from '@playwright/test';

/**
 * 외부 API 경계 라우팅.
 *
 * `E2E_MODE`가 'live'가 아니면 **항상** /api/chat·/api/contact를 가로챈다.
 * 즉 모드 스위치를 명시적으로 켜지 않는 한 실제 Groq·Gmail로 나가지 않는다
 * (스테이지가 모드를 바꾸지 못하게 하는 안전판).
 *
 * fixture 출처: **③ 스키마 유도 — [실측 캡처 아님]**.
 * 이 저장소가 소유한 `src/app/api/{chat,contact}/route.ts`의 응답 계약에서 유도했으며,
 * 상류(Groq·Gmail) 계약 drift는 구조적으로 잡지 못한다.
 * **mock 통과는 연동 검증이 아니다.**
 */
export const isLiveMode = process.env.E2E_MODE === 'live';

/** mock 모드에서 챗 응답으로 흘려보낼 청크 */
export const CHAT_CHUNKS = ['안녕하세요. ', '홍승아의 ', '포트폴리오 도우미입니다.'];
export const CHAT_REPLY = CHAT_CHUNKS.join('');

export async function routeApi(page: Page): Promise<void> {
  if (isLiveMode) return;

  await page.route('**/api/chat', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { available: true } });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'text/plain; charset=utf-8',
      body: CHAT_REPLY,
    });
  });

  await page.route('**/api/contact', async (route) => {
    await route.fulfill({ status: 200, json: { ok: true } });
  });
}

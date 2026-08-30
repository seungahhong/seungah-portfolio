// @vitest-environment jsdom
// gtag는 window.dataLayer라는 브라우저 경계에 큐를 쌓는 순수 로직이다.
// unit project는 node 환경이지만, window 없이는 큐 자체를 관측할 수 없어 이 파일만 jsdom으로 돈다.

import { describe, it, expect, afterEach, vi } from 'vitest';

/** API 경계: 네트워크 호출 없음. gtag.js를 실제로 내려받는 부분은 검증 범위 밖이다(남의 코드). */

/** `isAnalyticsEnabled`는 모듈 로드 시점에 확정된다 — import 전에 환경을 세운다 */
async function loadGtag(gaId: string, nodeEnv: string) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_GA_ID', gaId);
  vi.stubEnv('NODE_ENV', nodeEnv);
  delete window.dataLayer;
  return import('../gtag');
}

const commandsOf = () => [...(window.dataLayer ?? [])].map((entry) => (entry as IArguments)[0]);

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.dataLayer;
});

describe('gtag — 미설정이면 전부 no-op (ADR 0005)', () => {
  it('[AC-33.1] GA ID가 없으면 init·pageview·event가 흔적을 남기지 않는다', async () => {
    const gtag = await loadGtag('', 'production');

    gtag.init();
    gtag.pageview();
    gtag.event({ action: 'tab_switch' });

    expect(gtag.isAnalyticsEnabled).toBe(false);
    expect(window.dataLayer).toBeUndefined();
  });

  it('[AC-33.2] production이 아니면 GA ID가 있어도 끈다', async () => {
    // 로컬 개발 이벤트가 실제 리포트를 오염시키지 않게 한다
    const gtag = await loadGtag('G-TEST123456', 'development');

    gtag.init();
    gtag.pageview();

    expect(gtag.isAnalyticsEnabled).toBe(false);
    expect(window.dataLayer).toBeUndefined();
  });
});

describe('gtag — 활성일 때의 큐', () => {
  it('[AC-33.3] init이 js와 config를 순서대로 큐에 넣는다', async () => {
    const gtag = await loadGtag('G-TEST123456', 'production');

    gtag.init();

    expect(commandsOf()).toEqual(['js', 'config']);
  });

  it('[AC-33.4] config는 자동 페이지뷰를 끈다', async () => {
    // 페이지뷰를 직접 보내므로 자동 수집과 겹치면 두 번 집계된다
    const gtag = await loadGtag('G-TEST123456', 'production');

    gtag.init();
    const config = [...window.dataLayer!].find(
      (entry) => (entry as IArguments)[0] === 'config'
    ) as IArguments;

    expect(config[1]).toBe('G-TEST123456');
    expect(config[2]).toEqual({ send_page_view: false });
  });

  it('[AC-33.5] 큐에 쌓이는 것은 배열이 아니라 arguments 객체다', async () => {
    // gtag.js가 arguments 객체를 전제한다 — 배열을 push하면 명령이 조용히 무시된다
    const gtag = await loadGtag('G-TEST123456', 'production');

    gtag.init();

    for (const entry of window.dataLayer!) {
      expect(Array.isArray(entry)).toBe(false);
      expect(Object.prototype.toString.call(entry)).toBe('[object Arguments]');
    }
  });

  it('[AC-33.6] pageview는 경로를 page_location으로 보낸다', async () => {
    // GA4는 UA 시절의 page_path가 아니라 page_location에서 경로를 파생한다
    const gtag = await loadGtag('G-TEST123456', 'production');

    gtag.pageview();
    const event = [...window.dataLayer!][0] as IArguments;

    expect(event[0]).toBe('event');
    expect(event[1]).toBe('page_view');
    expect(event[2]).toMatchObject({ page_location: window.location.href });
  });

  it('[AC-33.7] event는 커스텀 파라미터를 GA4 이름으로 매핑한다', async () => {
    const gtag = await loadGtag('G-TEST123456', 'production');

    gtag.event({ action: 'tab_switch', category: 'nav', label: 'chat', value: 1 });
    const event = [...window.dataLayer!][0] as IArguments;

    expect(event[1]).toBe('tab_switch');
    expect(event[2]).toEqual({ event_category: 'nav', event_label: 'chat', value: 1 });
  });
});

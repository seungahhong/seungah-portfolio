'use client';
// GoogleAnalytics는 'use client' 모듈이다 — arch-guard R2 대응(vitest에서는 no-op).

import type { ComponentType } from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';

/**
 * API 경계: mock · ② 모듈 double(next/script, next/navigation). 네트워크 호출 없음.
 * 검증 범위 밖 — gtag.js를 실제로 내려받아 큐를 처리하는 부분(남의 코드).
 */
const nav = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }));
vi.mock('next/script', () => ({
  // next/script를 대신하는 목이라 실제 로딩 전략(afterInteractive)은 재현하지 않는다.
  // eslint-disable-next-line @next/next/no-sync-scripts
  default: ({ id, src }: { id?: string; src?: string }) => <script id={id} src={src} />,
}));

/**
 * `isAnalyticsEnabled`는 모듈 로드 시점에 환경변수로 확정된다.
 * 그래서 import 전에 환경을 세우고 모듈 그래프를 다시 만든다.
 */
async function loadGA(gaId: string, nodeEnv: string) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_GA_ID', gaId);
  vi.stubEnv('NODE_ENV', nodeEnv);
  delete window.dataLayer;
  const loaded = await import('../GoogleAnalytics');
  return loaded.GoogleAnalytics as ComponentType;
}

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  delete window.dataLayer;
  nav.pathname = '/';
});

describe('GoogleAnalytics — 미설정이면 조용히 비활성 (ADR 0005)', () => {
  it('[AC-31.1] GA ID가 없으면 아무것도 렌더하지 않는다', async () => {
    const GA = await loadGA('', 'production');
    const { container } = render(<GA />);
    expect(container).toBeEmptyDOMElement();
  });

  it('[AC-31.2] GA ID가 없으면 dataLayer를 만들지도 않는다', async () => {
    // 축소는 "죽지 않는 것"에 그치지 않는다 — 흔적을 남기지 않아야 개발 중 리포트가 오염되지 않는다
    const GA = await loadGA('', 'production');
    render(<GA />);
    expect(window.dataLayer).toBeUndefined();
  });

  it('[AC-31.3] production이 아니면 GA ID가 있어도 계측하지 않는다', async () => {
    const GA = await loadGA('G-TEST123456', 'development');
    const { container } = render(<GA />);
    expect(container).toBeEmptyDOMElement();
    expect(window.dataLayer).toBeUndefined();
  });
});

describe('GoogleAnalytics — 활성일 때의 큐 순서', () => {
  it('[AC-31.4] 스크립트를 싣고 config → page_view 순서로 큐에 넣는다', async () => {
    const GA = await loadGA('G-TEST123456', 'production');
    const { container } = render(<GA />);

    expect(container.querySelector('script')).toHaveAttribute(
      'src',
      'https://www.googletagmanager.com/gtag/js?id=G-TEST123456'
    );

    const commands = [...(window.dataLayer ?? [])].map((entry) => (entry as IArguments)[0]);
    expect(commands).toEqual(['js', 'config', 'event']);
  });

  it('[AC-31.5] dataLayer 항목은 배열이 아니라 arguments 객체다', async () => {
    // gtag.js가 arguments 객체를 전제한다 — 배열을 push하면 명령이 조용히 무시된다
    const GA = await loadGA('G-TEST123456', 'production');
    render(<GA />);

    for (const entry of window.dataLayer ?? []) {
      expect(Array.isArray(entry)).toBe(false);
      expect(Object.prototype.toString.call(entry)).toBe('[object Arguments]');
    }
  });

  it('[AC-31.6] config는 자동 페이지뷰를 끄고 직접 보낸다', async () => {
    const GA = await loadGA('G-TEST123456', 'production');
    render(<GA />);

    const config = [...(window.dataLayer ?? [])].find(
      (entry) => (entry as IArguments)[0] === 'config'
    ) as IArguments;
    expect(config[1]).toBe('G-TEST123456');
    expect(config[2]).toEqual({ send_page_view: false });
  });
});

describe('GoogleAnalytics — 라우트 변경', () => {
  it('[AC-31.7] 경로가 바뀌면 페이지뷰만 다시 보내고 초기화는 한 번만 한다', async () => {
    const GA = await loadGA('G-TEST123456', 'production');
    const { rerender } = render(<GA />);

    nav.pathname = '/career/wadiz';
    rerender(<GA />);

    const commands = [...(window.dataLayer ?? [])].map((entry) => (entry as IArguments)[0]);
    expect(commands.filter((command) => command === 'config')).toHaveLength(1);
    expect(commands.filter((command) => command === 'event')).toHaveLength(2);
  });
});

/**
 * Google Analytics 4 (gtag.js) 래퍼.
 *
 * 이 모듈에는 `'use client'` 지시어를 두지 않는다. `NEXT_PUBLIC_` 환경변수는 빌드 시점에
 * 문자열로 치환되므로 서버·클라이언트 어느 쪽에서 import해도 같은 값이 보인다.
 *
 * `gtag()`는 호출 시점에 `dataLayer`를 만들고 명령을 큐에 넣는다. gtag.js가 아직 로드되지
 * 않았어도 큐가 그대로 보존됐다가 로드 시 순서대로 처리되므로, 스크립트 로드와
 * React 이펙트의 실행 순서를 신경 쓸 필요가 없다.
 */

/** GA4 측정 ID (`G-XXXXXXXXXX`). 미설정이면 계측을 전부 건너뛴다. */
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

/**
 * 계측 활성 여부.
 *
 * 로컬 개발 중 발생한 이벤트가 실제 리포트를 오염시키지 않도록 development에서는 끈다.
 * 따라서 GA 동작 확인은 `pnpm build && pnpm start`(production)로 해야 한다.
 */
export const isAnalyticsEnabled =
  GA_TRACKING_ID !== '' && process.env.NODE_ENV === 'production';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * gtag.js 공식 스니펫과 동일한 큐잉 방식.
 *
 * gtag.js는 `dataLayer`에 쌓인 항목이 **`arguments` 객체**일 것을 전제하므로 배열을 push하면
 * 안 된다. 그래서 매개변수를 선언하지 않고 `arguments`를 그대로 넘긴 뒤, 호출부 타입만
 * 아래에서 다시 붙인다.
 */
function gtagRaw(): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

export const gtag = gtagRaw as (...args: unknown[]) => void;

/** gtag.js 초기화 — `send_page_view: false`로 두고 페이지뷰는 아래에서 직접 보낸다 */
export function init(): void {
  if (!isAnalyticsEnabled) return;
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID, { send_page_view: false });
}

/**
 * 페이지뷰 전송.
 *
 * App Router의 클라이언트 내비게이션은 문서를 새로 로드하지 않으므로 GA가 자동으로 잡지
 * 못한다(향상된 측정의 history 이벤트 수집을 껐다면 특히). 경로가 바뀔 때마다 직접 보낸다.
 */
export function pageview(): void {
  if (!isAnalyticsEnabled) return;
  gtag('event', 'page_view', {
    // GA4는 경로를 `page_location`에서 파생한다. UA 시절의 `page_path`는 보내지 않는다.
    page_location: window.location.href,
    page_title: document.title,
  });
}

type GTagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
};

/** 커스텀 이벤트 — 탭 전환·외부 링크 클릭 등 원하는 지점에서 호출한다 */
export function event({ action, category, label, value }: GTagEvent): void {
  if (!isAnalyticsEnabled) return;
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { GA_TRACKING_ID, init, isAnalyticsEnabled, pageview } from '@/lib/analytics/gtag';

/**
 * GA4 계측 스크립트 + 라우트 변경 페이지뷰.
 *
 * `usePathname`만 쓴다. `useSearchParams`를 쓰면 Suspense 경계가 폴백으로 떨어지면서
 * 정적 페이지 HTML이 비어버리므로(CLAUDE.md 참고) 절대 도입하지 않는다.
 * 그래서 `?tab=chat` 같은 쿼리 변경은 페이지뷰로 잡히지 않는다 — 탭 전환은 페이지 이동이
 * 아니므로 의도한 동작이며, 필요하면 `event()`로 커스텀 이벤트를 보낸다.
 *
 * 초기화(`js`/`config`)와 첫 페이지뷰를 같은 이펙트에서 순서대로 큐에 넣기 때문에
 * gtag.js 로드 타이밍과 무관하게 항상 config → page_view 순서가 보장된다.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAnalyticsEnabled) return;
    if (!initialized.current) {
      initialized.current = true;
      init();
    }
    pageview();
  }, [pathname]);

  if (!isAnalyticsEnabled) return null;

  return (
    <Script
      id="ga4-gtag"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
    />
  );
}

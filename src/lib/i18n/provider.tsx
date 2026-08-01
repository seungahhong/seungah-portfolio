'use client';

import { createContext, type ReactNode } from 'react';
import { DEFAULT_LOCALE, type Locale } from './constants';

export type { Locale };

interface I18nContextValue {
  locale: Locale;
}

export const I18nContext = createContext<I18nContextValue>({ locale: DEFAULT_LOCALE });

/**
 * 로케일 컨텍스트.
 *
 * 로케일은 URL이 결정한다 (`/` = 한국어, `/en` = 영어).
 * 서버가 라우트별 루트 레이아웃에서 값을 내려주므로 쿠키나 마운트 후 보정이 필요 없고,
 * 첫 서버 렌더링부터 클라이언트 컴포넌트까지 같은 언어로 그려진다.
 */
export function I18nProvider({
  children,
  locale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  locale?: Locale;
}) {
  return <I18nContext.Provider value={{ locale }}>{children}</I18nContext.Provider>;
}

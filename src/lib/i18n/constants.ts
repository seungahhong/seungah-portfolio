/**
 * 서버·클라이언트 양쪽에서 쓰는 로케일 상수.
 *
 * `'use client'` 모듈에 두면 서버 컴포넌트가 import할 때 값이 아니라
 * 클라이언트 참조 프록시로 넘어와 조용히 실패한다. 그래서 지시어 없는 별도 모듈로 분리한다.
 */
// 타입의 소유는 types/ 다(의존 방향 lib → types). 기존 import 경로를 지키려고 여기서 재수출한다.
import type { Locale } from '@/types/locale';
export type { Locale };

/** 기본 로케일 — 접두사 없는 경로(`/`, `/career/wadiz`)가 이 언어다 */
export const DEFAULT_LOCALE: Locale = 'ko';

export const LOCALES: readonly Locale[] = ['ko', 'en'];

/** 영어 라우트 접두사 (기본 로케일은 접두사 없음) */
export const EN_PREFIX = '/en';

/**
 * 로케일 중립 경로(`/`, `/career/wadiz`)를 실제 라우트로 변환한다.
 * - ko → `/career/wadiz`
 * - en → `/en/career/wadiz`
 */
export function localizedPath(locale: Locale, path: string = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale !== 'en') return normalized;
  return normalized === '/' ? EN_PREFIX : `${EN_PREFIX}${normalized}`;
}

/**
 * 현재 경로에서 로케일 접두사를 떼어 로케일 중립 경로를 얻는다.
 * 언어 전환 시 같은 문서의 다른 언어 버전을 찾는 데 쓴다.
 */
export function neutralPath(pathname: string): string {
  if (pathname === EN_PREFIX) return '/';
  if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length);
  return pathname || '/';
}

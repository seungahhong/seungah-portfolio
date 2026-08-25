import { describe, it, expect } from 'vitest';
import { localizedPath, neutralPath, LOCALES } from '../constants';

/** 로케일 중립 경로 표본 — 실제 라우트 구조를 대표한다 */
const NEUTRAL_PATHS = ['/', '/career/wadiz', '/career/hancom', '/contact'];

describe('localizedPath', () => {
  it('[AC-8.1] 기본 로케일(ko)은 접두사를 붙이지 않는다', () => {
    for (const p of NEUTRAL_PATHS) {
      expect(localizedPath('ko', p)).toBe(p);
    }
  });

  // 이 한 줄이 회귀 지점이다 — '/en/'이 되면 링크마다 슬래시가 하나씩 더 붙는다
  it("[AC-8.2] 영어 루트는 '/en/'이 아니라 '/en'이다", () => {
    expect(localizedPath('en', '/')).toBe('/en');
  });

  it('[AC-8.3] 영어 하위 경로는 /en 접두사를 갖는다', () => {
    expect(localizedPath('en', '/career/wadiz')).toBe('/en/career/wadiz');
  });
});

describe('neutralPath', () => {
  it("[AC-8.4] '/en'은 '/'로 되돌린다", () => {
    expect(neutralPath('/en')).toBe('/');
  });

  it('[AC-8.5] 영어 하위 경로에서 접두사를 뗀다', () => {
    expect(neutralPath('/en/career/wadiz')).toBe('/career/wadiz');
  });

  it('[AC-8.6] 한국어 경로는 그대로 둔다', () => {
    expect(neutralPath('/career/wadiz')).toBe('/career/wadiz');
  });
});

describe('왕복 불변식 — 언어 토글이 같은 문서의 짝을 찾는 근거', () => {
  it('[AC-8.7] neutralPath(localizedPath(locale, p)) === p — 모든 로케일 × 경로', () => {
    for (const locale of LOCALES) {
      for (const p of NEUTRAL_PATHS) {
        expect(neutralPath(localizedPath(locale, p))).toBe(p);
      }
    }
  });
});

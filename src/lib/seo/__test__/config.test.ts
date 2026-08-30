import { describe, it, expect, afterEach, vi } from 'vitest';
import { SITE_URL, absoluteUrl, alternatesFor, localizedUrl } from '../config';

/** API 경계: 네트워크 호출 없음. 순수 URL 조립 함수다. */

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('alternatesFor — hreflang 신호', () => {
  it('[AC-32.1] canonical과 세 개의 언어 대체 링크를 함께 만든다', () => {
    // 언어별 URL이 없으면 성립하지 않는 신호다. 키가 빠지면 검색엔진이 두 버전을 별개 문서로 본다.
    const alternates = alternatesFor('ko', '/career/wadiz');

    expect(alternates.canonical).toBe('/career/wadiz');
    expect(Object.keys(alternates.languages)).toEqual(['ko-KR', 'en-US', 'x-default']);
  });

  it('[AC-32.2] x-default는 한국어를 가리킨다', () => {
    // 기본 로케일이 한국어이므로 접두사 없는 경로가 정본이다
    for (const locale of ['ko', 'en'] as const) {
      expect(alternatesFor(locale, '/career/wadiz').languages['x-default']).toBe('/career/wadiz');
    }
  });

  it('[AC-32.3] 언어 대체 링크는 로케일과 무관하게 같은 쌍을 가리킨다', () => {
    // 어느 언어 페이지에서 읽든 두 버전의 관계는 같아야 한다
    expect(alternatesFor('en', '/career/wadiz').languages).toEqual(
      alternatesFor('ko', '/career/wadiz').languages
    );
  });

  it('[AC-32.4] 영어 canonical에는 /en 접두사가 붙는다', () => {
    expect(alternatesFor('en', '/career/wadiz').canonical).toBe('/en/career/wadiz');
  });

  it('[AC-32.5] 홈에서는 한국어가 접두사 없는 경로다', () => {
    expect(alternatesFor('ko').canonical).toBe('/');
    expect(alternatesFor('en').canonical).toBe('/en');
  });
});

describe('absoluteUrl / localizedUrl — 절대 URL 조립', () => {
  it('[AC-32.6] 로케일 경로를 사이트 주소에 이어 붙인다', () => {
    expect(localizedUrl('en', '/career/wadiz')).toBe(`${SITE_URL}/en/career/wadiz`);
    expect(localizedUrl('ko', '/career/wadiz')).toBe(`${SITE_URL}/career/wadiz`);
  });

  it('[AC-32.7] 슬래시가 중복되지 않는다', () => {
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`);
    expect(localizedUrl('en')).not.toContain('//en');
  });

  it('[AC-32.8] 선행 슬래시가 없는 경로도 절대 URL이 된다', () => {
    expect(absoluteUrl('llms.txt')).toBe(`${SITE_URL}/llms.txt`);
  });
});

describe('SITE_URL — 환경변수 정규화', () => {
  it('[AC-32.9] 후행 슬래시를 제거한다', async () => {
    // 제거하지 않으면 canonical·JSON-LD·사이트맵이 전부 이중 슬래시를 갖는다
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.test/');
    const loaded = await import('../config');

    expect(loaded.SITE_URL).toBe('https://example.test');
    expect(loaded.absoluteUrl('/')).toBe('https://example.test/');
  });
});

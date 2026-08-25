import { describe, it, expect } from 'vitest';
import { t, tList, hasTranslation } from '../t';

/**
 * 타입상 유효하지만 JSON에는 없는 키.
 * `DynamicKey`의 `career.roles.${string}` 분기를 이스케이프 해치로 쓴다 —
 * 이렇게 해야 typecheck를 통과하면서 "키 부재" 계약을 검증할 수 있다.
 */
const MISSING_KEY = 'career.roles.__does_not_exist__' as const;

/** 값에 `{count}` 자리표시자가 있는 실제 키 */
const PARAM_KEY = 'career.more';

describe('t() — 키를 못 찾을 때', () => {
  // 이 계약이 깨지면 오타가 예외 없이 배포 HTML에 그대로 박힌다.
  it('[AC-9.1] 키 문자열을 그대로 반환한다 (예외를 던지지 않는다)', () => {
    expect(t('ko', MISSING_KEY)).toBe(MISSING_KEY);
    expect(t('en', MISSING_KEY)).toBe(MISSING_KEY);
  });
});

describe('t() — 자리표시자 치환', () => {
  it('[AC-9.2] 제공된 파라미터를 치환하고 자리표시자를 남기지 않는다', () => {
    const out = t('ko', PARAM_KEY, { count: 3 });
    expect(out).toContain('3');
    expect(out).not.toContain('{count}');
  });

  it('[AC-9.3] 파라미터를 주지 않으면 자리표시자를 원문 그대로 남긴다', () => {
    expect(t('ko', PARAM_KEY)).toContain('{count}');
  });
});

describe('t() — 로케일 분기', () => {
  // 값 자체를 복사하지 않고 "언어가 실제로 갈린다"만 단정한다.
  it('[AC-9.4] 같은 키가 로케일마다 다른 문자열을 준다', () => {
    const ko = t('ko', 'nav.about');
    const en = t('en', 'nav.about');
    expect(ko).not.toBe(en);
    expect(ko).not.toBe('nav.about'); // 키 누수가 아님
    expect(en).not.toBe('nav.about');
  });
});

describe('tList()', () => {
  it('[AC-9.5] 배열 키는 비어있지 않은 문자열 배열을 준다', () => {
    const list = tList('ko', 'about.descriptions');
    expect(list.length).toBeGreaterThan(0);
    expect(list.every(item => typeof item === 'string')).toBe(true);
  });

  it('[AC-9.6] 배열이 아니면 빈 배열을 준다 (예외를 던지지 않는다)', () => {
    expect(tList('ko', MISSING_KEY)).toEqual([]);
  });
});

describe('hasTranslation()', () => {
  it('[AC-9.7] 존재 여부를 구분한다 — 선택적 항목 렌더링 분기의 근거', () => {
    expect(hasTranslation('ko', 'nav.about')).toBe(true);
    expect(hasTranslation('ko', MISSING_KEY)).toBe(false);
  });
});

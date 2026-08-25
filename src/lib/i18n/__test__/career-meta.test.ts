import { describe, it, expect } from 'vitest';
import { careerMetaValue } from '../career-meta';
import { LOCALES } from '../constants';
import type { ICareerMeta } from '@/types';
import { careers } from '@/helpers/datas/career';

const ROLE_META: ICareerMeta = { labelKey: 'role', valueKey: 'frontend' };
const TECH_META: ICareerMeta = { labelKey: 'frontend', value: 'React, Vite, Typescript' };

describe('careerMetaValue — 값 소스 분기', () => {
  it('[AC-11.1] valueKey는 번역을 읽는다 — 로케일마다 달라야 한다', () => {
    const ko = careerMetaValue('ko', ROLE_META);
    const en = careerMetaValue('en', ROLE_META);
    expect(ko).not.toBe(en);
    // 키가 그대로 새어나오지 않는다
    expect(ko).not.toContain('career.roles');
    expect(en).not.toContain('career.roles');
  });

  it('[AC-11.2] value는 데이터 값을 그대로 쓴다 — 로케일과 무관하게 같아야 한다', () => {
    expect(careerMetaValue('ko', TECH_META)).toBe(TECH_META.value);
    expect(careerMetaValue('en', TECH_META)).toBe(TECH_META.value);
  });

  // 이 대비가 이 함수의 존재 이유다 — 직무명을 value에 적으면 한쪽이 반대 언어로 노출된다.
  it('[AC-11.3] 두 경로의 로케일 민감도가 반대다', () => {
    const roleDiffers = careerMetaValue('ko', ROLE_META) !== careerMetaValue('en', ROLE_META);
    const techSame = careerMetaValue('ko', TECH_META) === careerMetaValue('en', TECH_META);
    expect(roleDiffers).toBe(true);
    expect(techSame).toBe(true);
  });
});

/**
 * 데이터 계약 — i18n-guard R7의 공백을 메운다.
 * R7은 `career.companies.*`만 검사하고 `career.roles.{valueKey}`는 검사하지 않으므로,
 * valueKey 오타가 typecheck·guard·build를 전부 통과해 화면에 키로 렌더된다.
 */
describe('career.ts의 모든 valueKey가 양 로케일에서 해석된다', () => {
  const valueKeys = careers
    .flatMap((company) => company.items.flatMap((item) => (item.meta ?? []).map((meta) => meta.valueKey)))
    .filter((key): key is string => typeof key === 'string');

  // 0건 통과는 무증상 실패다 — 데이터 구조가 바뀌면 이 검사가 조용히 무력해진다.
  it('[AC-11.4] 검사 대상 valueKey가 존재한다', () => {
    expect(valueKeys.length).toBeGreaterThan(0);
  });

  it('[AC-11.5] 키 누수 없이 실제 문구로 해석된다', () => {
    for (const locale of LOCALES) {
      for (const valueKey of valueKeys) {
        const resolved = careerMetaValue(locale, { labelKey: 'role', valueKey });
        expect(resolved, `${locale}: career.roles.${valueKey}`).not.toContain('career.roles');
        expect(resolved.length).toBeGreaterThan(0);
      }
    }
  });
});

import { describe, it, expect } from 'vitest';
import { SECTIONS, isSectionId, sectionPath } from '../sections';
import { LOCALES } from '../i18n/constants';

/** 상대 경로를 파싱하기 위한 더미 오리진 — 네트워크를 타지 않는다 */
const BASE = 'https://example.test';

describe('sectionPath — 로케일 접두사와 쿼리의 순서', () => {
  it('[AC-13.1] 한국어는 접두사 없이 쿼리만 붙인다', () => {
    expect(sectionPath('ko', 'about')).toBe('/?tab=about');
  });

  // 회귀 지점: localizedPath에 쿼리를 통째로 넘기면 '/en/?tab=about'이 된다.
  it('[AC-13.2] 영어는 /en 뒤에 쿼리가 붙고 슬래시가 중복되지 않는다', () => {
    expect(sectionPath('en', 'about')).toBe('/en?tab=about');
  });

  // 문자열 휴리스틱 대신 구조를 본다 — ko의 정상 '/'와 en의 결함 '/en/'을 한 규칙으로 가른다.
  it('[AC-13.3] 모든 섹션 × 로케일에서 경로와 쿼리가 분리된다', () => {
    for (const locale of LOCALES) {
      for (const section of SECTIONS) {
        const url = new URL(sectionPath(locale, section.id), BASE);
        expect(url.pathname, `${locale}/${section.id}`).toBe(locale === 'en' ? '/en' : '/');
        expect(url.searchParams.get('tab')).toBe(section.id);
      }
    }
  });
});

describe('isSectionId', () => {
  it('[AC-13.4] 실제 섹션 id를 모두 인정한다', () => {
    for (const section of SECTIONS) {
      expect(isSectionId(section.id), section.id).toBe(true);
    }
  });

  // chat은 TabContext가 챗 탭으로 해석하는 예약어다.
  it('[AC-13.5] chat은 섹션 id가 아니다', () => {
    expect(isSectionId('chat')).toBe(false);
  });

  it('[AC-13.6] null·undefined·빈 문자열을 거부한다', () => {
    expect(isSectionId(null)).toBe(false);
    expect(isSectionId(undefined)).toBe(false);
    expect(isSectionId('')).toBe(false);
  });
});

describe('SECTIONS — 예약어 제약', () => {
  /**
   * 타입·가드·빌드 어느 것도 이것을 막지 않는다(주석으로만 존재하는 제약).
   * chat이 섹션에 들어가면 그 목차 항목은 클릭하는 순간 챗 탭으로 전환된다.
   */
  it('[AC-13.7] 섹션 목록에 예약어 chat이 없다', () => {
    const ids: string[] = SECTIONS.map((section) => section.id);
    expect(ids).not.toContain('chat');
  });
});

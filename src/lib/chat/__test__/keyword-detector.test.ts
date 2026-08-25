import { describe, it, expect } from 'vitest';
import { detectCardType } from '../keyword-detector';

describe('detectCardType — 한/영 혼용 키워드', () => {
  it('[AC-12.1] 한국어 경력 키워드를 career로 판정한다', () => {
    expect(detectCardType('와디즈에서 어떤 업무를 하셨나요')).toBe('career');
  });

  it('[AC-12.2] 영어 경력 키워드를 career로 판정한다', () => {
    // profile 키워드('about' 등)가 섞이지 않은 입력이어야 우선순위와 무관하게 검증된다
    expect(detectCardType('which company did you work for')).toBe('career');
  });

  it('[AC-12.3] 한국어 프로필 키워드를 profile로 판정한다', () => {
    expect(detectCardType('간단한 소개 부탁드립니다')).toBe('profile');
  });

  it('[AC-12.4] 영어 프로필 키워드를 profile로 판정한다', () => {
    expect(detectCardType('what is your email')).toBe('profile');
  });
});

describe('detectCardType — 매칭 규칙', () => {
  it('[AC-12.5] 대소문자를 무시한다 (사용자는 자유롭게 입력한다)', () => {
    expect(detectCardType('WADIZ')).toBe('career');
    expect(detectCardType('GitHub')).toBe('profile');
  });

  it('[AC-12.6] 매칭되는 키워드가 없으면 null이다 (카드를 붙이지 않는다)', () => {
    expect(detectCardType('오늘 날씨가 좋네요')).toBeNull();
  });

  it('[AC-12.7] 빈 문자열은 null이다', () => {
    expect(detectCardType('')).toBeNull();
  });
});

describe('detectCardType — 우선순위', () => {
  /**
   * ⚠️ 이 기대는 문서가 아니라 구현에서 유래했다.
   * 반환값이 하나뿐이라 어떤 우선순위든 존재해야 하지만,
   * "career가 이긴다"가 의도된 계약인지는 확인되지 않았다.
   */
  it('[AC-12.8] 두 종류 키워드를 함께 포함하면 career를 택한다', () => {
    expect(detectCardType('회사에서 쓰신 기술이 궁금합니다')).toBe('career');
  });
});

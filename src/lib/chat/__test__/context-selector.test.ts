import { describe, it, expect } from 'vitest';
import { selectDetails, toTerms, type DetailCandidate } from '../context-selector';

/**
 * 이 선택기는 Groq 무료 티어의 8,000 TPM을 지키는 유일한 장치다.
 * 그래서 "관련된 것을 고르는가"만큼 "예산을 넘지 않는가"도 계약이다.
 *
 * 후보는 합성값이다 — 실제 경력 데이터를 오라클로 쓰면 데이터가 바뀔 때마다 테스트가 깨지고,
 * 정작 검증하려는 선택 규칙은 그대로인데 실패가 난다.
 */
const candidate = (id: string, terms: string[], length: number): DetailCandidate => ({
  id,
  terms,
  text: 'x'.repeat(length),
});

const ids = (picked: DetailCandidate[]) => picked.map((entry) => entry.id);

describe('toTerms — 매칭 용어 정규화', () => {
  it('[AC-13.1] 구와 낱말을 함께 담는다 (둘 다 질의에 걸릴 수 있어야 한다)', () => {
    expect(toTerms('MSW 도입')).toEqual(expect.arrayContaining(['msw 도입', 'msw', '도입']));
  });

  it('[AC-13.2] 대소문자를 무시한다', () => {
    expect(toTerms('Wadiz')).toContain('wadiz');
  });

  it('[AC-13.3] 두 글자 미만은 버린다 (변별력이 없다)', () => {
    expect(toTerms('a b 앱')).not.toContain('a');
  });

  it('[AC-13.4] 라틴 두 글자는 버린다 (짧은 영문은 다른 낱말 안에 걸린다)', () => {
    expect(toTerms('ai')).not.toContain('ai');
    expect(toTerms('vue')).toContain('vue');
  });

  it('[AC-13.5] 연결어는 버린다 (어느 항목에나 있어 변별력이 없다)', () => {
    expect(toTerms('성능 및 안정성')).not.toContain('및');
  });
});

describe('selectDetails — 관련성', () => {
  const candidates = [
    candidate('wadiz:msw', ['와디즈', 'wadiz', 'msw', '모킹'], 100),
    candidate('wadiz:perf', ['와디즈', 'wadiz', '성능', '최적화'], 100),
    candidate('study:state', ['상태관리', 'redux'], 100),
  ];

  it('[AC-13.6] 걸리는 용어가 없으면 아무것도 싣지 않는다', () => {
    expect(selectDetails(candidates, '오늘 날씨가 좋네요', 10_000)).toEqual([]);
  });

  it('[AC-13.7] 조사가 붙어도 매칭된다 (한국어에는 어절 경계가 없다)', () => {
    expect(ids(selectDetails(candidates, '와디즈에서는 무엇을 하셨나요', 10_000))).toContain('wadiz:msw');
  });

  it('[AC-13.8] 회사만 지목하면 그 회사의 항목이 모두 걸린다', () => {
    expect(ids(selectDetails(candidates, '와디즈 이야기', 10_000))).toEqual(['wadiz:msw', 'wadiz:perf']);
  });

  it('[AC-13.9] 항목을 지목하면 흔한 용어만 걸린 후보는 밀려난다', () => {
    // 'wadiz'는 두 후보가 공유해 IDF가 낮고, 'msw'는 한 후보만 가져 높다.
    expect(ids(selectDetails(candidates, 'msw 도입 이야기', 10_000))).toEqual(['wadiz:msw']);
  });

  it('[AC-13.10] 반환 순서는 표시 순서를 지킨다 (점수순이 아니다)', () => {
    const picked = selectDetails(candidates, '상태관리 그리고 와디즈', 10_000);
    expect(ids(picked)).toEqual(['wadiz:msw', 'wadiz:perf', 'study:state']);
  });
});

describe('selectDetails — 예산', () => {
  it('[AC-13.11] 예산을 넘는 후보는 싣지 않는다', () => {
    const one = [candidate('big', ['와디즈'], 500)];
    expect(selectDetails(one, '와디즈', 100)).toEqual([]);
  });

  it('[AC-13.12] 고른 본문의 총 길이가 예산을 넘지 않는다', () => {
    const many = Array.from({ length: 20 }, (_, i) => candidate(`c${i}`, ['와디즈'], 100));
    const picked = selectDetails(many, '와디즈', 550);
    expect(picked.reduce((sum, entry) => sum + entry.text.length, 0)).toBeLessThanOrEqual(550);
  });

  it('[AC-13.13] 예산을 넘는 후보에서 멈추지 않고 다음 후보를 본다', () => {
    // 큰 항목 하나가 뒤의 작은 항목들을 통째로 막으면 안 된다.
    const mixed = [
      candidate('huge', ['와디즈', '성능'], 400),
      candidate('small', ['와디즈', '성능'], 50),
    ];
    expect(ids(selectDetails(mixed, '와디즈 성능', 100))).toEqual(['small']);
  });
});

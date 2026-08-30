import { describe, it, expect } from 'vitest';
import { buildPortfolioSystemPrompt } from '../portfolio-context';

/**
 * 이 프롬프트는 Groq **무료 티어의 8,000 TPM 안에서** 돌아야 한다.
 * TPM은 입력과 출력을 함께 세므로 상한을 넘으면 답변이 나오지 않는다 — 화면에는 에러만 남는다.
 *
 * 런타임에 토크나이저가 없어 글자 수로 검사한다. 아래 상한에서 실측(o200k_base) 토큰은
 * ko 5,266 / en 4,527이고, 여기에 히스토리(≤2,000자 ≈870)와 응답(1,024)을 더해도 한도 아래다.
 * 상한을 올리려면 `pnpm verify`가 아니라 실제 토큰을 다시 재고 이 숫자를 함께 고쳐야 한다.
 */
const MAX_PROMPT_CHARS = { ko: 13_000, en: 19_000 } as const;

/** 모든 회사·항목·주제를 한 번에 지목해 상세 본문 예산을 최대로 밀어붙이는 질의 */
const EVERYTHING =
  '와디즈 wadiz 한글과컴퓨터 hancom 오스템 osstem 블루버드 bluebird msw 성능 최적화 ' +
  '상태관리 react next.js typescript 테스트 빌드 폼 스타일링 프로세스 자동화 글로벌 ' +
  '커머스 스토어 리워드 대시보드 레거시 모놀리스 devops 쿠버네티스 AI 워크플로 ' +
  '웹한글 기안기 임플란트 모뎀 wince 전부 자세히';

const detailsOf = (prompt: string) =>
  prompt.split('# Details (loaded for this question)')[1] ?? '';

describe.each(['ko', 'en'] as const)('buildPortfolioSystemPrompt(%s) — 예산', (locale) => {
  it(`[AC-14.1] 질의가 없어도 상한을 넘지 않는다`, () => {
    expect(buildPortfolioSystemPrompt(locale).length).toBeLessThanOrEqual(MAX_PROMPT_CHARS[locale]);
  });

  it(`[AC-14.2] 모든 항목을 지목하는 질의에도 상한을 넘지 않는다`, () => {
    const prompt = buildPortfolioSystemPrompt(locale, EVERYTHING);
    expect(prompt.length).toBeLessThanOrEqual(MAX_PROMPT_CHARS[locale]);
  });
});

describe('buildPortfolioSystemPrompt — core / detail 분리', () => {
  it('[AC-14.3] 관련 없는 질의에는 상세 본문을 싣지 않는다', () => {
    expect(detailsOf(buildPortfolioSystemPrompt('ko', '오늘 날씨가 좋네요'))).toBe('');
  });

  it('[AC-14.4] 항목을 지목하면 그 항목의 본문이 실린다', () => {
    // 'msw'는 URL 해시로 쓰이는 안정된 id다(바꾸면 외부 링크가 깨진다 — CLAUDE.md).
    expect(detailsOf(buildPortfolioSystemPrompt('ko', 'MSW 도입 이야기'))).toContain('/career/wadiz#msw');
  });

  it('[AC-14.5] 상세 본문이 비어도 색인은 항상 실린다 (무엇이 있는지는 늘 답할 수 있어야 한다)', () => {
    const prompt = buildPortfolioSystemPrompt('ko', '안녕하세요');
    expect(prompt).toContain('# Career (index)');
    expect(prompt).toContain('(#msw)');
  });

  it('[AC-14.6] 영어 로케일은 영어 경로로 앵커를 만든다', () => {
    expect(detailsOf(buildPortfolioSystemPrompt('en', 'tell me about MSW'))).toContain('/en/career/wadiz#msw');
  });
});

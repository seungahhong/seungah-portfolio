import { buildPortfolioSystemPrompt } from '@/lib/chat/portfolio-context';

/**
 * 개발 전용 — AI 챗 시스템 프롬프트 조회.
 *
 * "데이터 한 곳 → 출력 네 곳"(화면·JSON-LD·llms.txt·챗 프롬프트) 중 네 번째만
 * 자격증명 없이는 관측할 수 없었다. 프롬프트가 본문과 어긋나도 아무도 알려주지 않는다는 뜻이다.
 *
 * 이것이 이 스택에서의 테스트 어댑터다 — LLM 어댑터를 떼고 Port(프롬프트 조립)의 출력만 노출한다.
 * 도메인 로직은 한 줄도 바뀌지 않는다.
 *
 * 프로덕션에서는 404다. 챗 프롬프트에는 공개 페이지에 없는 내용이 없지만,
 * 검증 편의를 위해 만든 표면을 운영에 남겨 둘 이유도 없다.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new Response(null, { status: 404 });
  }
  const params = new URL(req.url).searchParams;
  const locale = params.get('locale') ?? 'ko';

  // 프롬프트는 이제 질의에 따라 상세 본문이 달라진다(무료 티어 예산 — lib/chat/context-selector.ts).
  // `?q=`가 없으면 core만 나오므로, 무엇이 실리는지 보려면 실제 질문을 넣어야 한다.
  const query = params.get('q') ?? '';

  return new Response(buildPortfolioSystemPrompt(locale, query), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

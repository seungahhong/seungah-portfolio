import Groq from 'groq-sdk';
import { buildPortfolioSystemPrompt } from './portfolio-context';

export interface ChatMessage {
  role: string;
  content: string;
}

/**
 * `llama-3.3-70b-versatile`은 2026-08-16부로 free/developer 티어에서 폐기됐다(Enterprise 전용).
 * 폐기 후 호출은 `model_decommissioned`로 떨어지고, 라우트의 catch가 이를 500으로 뭉개
 * 화면에는 "Failed to get response"만 남았다.
 * 무료 티어에서 서빙되는 모델로 옮긴다: https://console.groq.com/docs/deprecations
 */
const GROQ_MODEL = 'openai/gpt-oss-120b';

/**
 * 무료 티어 한도가 8,000 TPM이고 TPM은 입력과 출력을 함께 센다.
 * 시스템 프롬프트(≈3,000) + 히스토리 + 응답이 그 안에 들어와야 해서 2,048에서 낮췄다.
 */
const MAX_COMPLETION_TOKENS = 1024;

/**
 * 모델에 보내는 히스토리 상한. 라우트의 `MAX_HISTORY`(20)는 요청을 거절하는 바깥 경계고,
 * 이쪽은 8,000 TPM 안에 맞추기 위해 실제로 보내는 양을 줄인다 — 오래된 턴부터 버린다.
 *
 * 턴 수가 아니라 **글자 수 총량**으로 자른다. 턴 수로만 자르면 긴 답변 한 개가 예산을 다 먹는다.
 * 2,000자는 실측 환산(ko 2.29 chars/token)으로 ≈870 토큰이고,
 * 프롬프트 최대치(ko 5,331) + 히스토리(870) + 응답(1,024) ≈ 7,225로 한도 아래에 들어온다.
 */
const MAX_SENT_HISTORY = 6;
const MAX_HISTORY_CHARS = 2000;

/** 최근 턴부터 글자 예산이 허락하는 만큼만 남긴다(시간 순서는 유지) */
function trimHistory(history: ChatMessage[]): ChatMessage[] {
  const kept: ChatMessage[] = [];
  let used = 0;

  for (const msg of history.slice(-MAX_SENT_HISTORY).reverse()) {
    const remaining = MAX_HISTORY_CHARS - used;
    if (remaining <= 0) break;
    const content = msg.content.slice(0, remaining);
    kept.unshift({ role: msg.role, content });
    used += content.length;
  }

  return kept;
}

export function isChatConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

function createGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }
  return new Groq({ apiKey });
}

export async function streamChatResponse(
  message: string,
  history: ChatMessage[],
  locale: string = 'ko'
): Promise<ReadableStream<Uint8Array>> {
  const groq = createGroqClient();

  const recent = trimHistory(history);

  // 프롬프트에 실을 상세 본문은 이번 질문만이 아니라 최근 사용자 발화까지 보고 고른다 —
  // "그거 더 자세히"처럼 대상이 앞 턴에만 있는 후속 질문을 놓치지 않기 위해서다.
  const query = [...recent.filter(msg => msg.role === 'user').map(msg => msg.content), message].join(' ');
  const systemPrompt = buildPortfolioSystemPrompt(locale, query);

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...recent.map(msg => ({
      role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    })),
    { role: 'user' as const, content: message },
  ];

  const stream = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    stream: true,
    max_completion_tokens: MAX_COMPLETION_TOKENS,
  });

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

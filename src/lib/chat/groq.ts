import Groq from 'groq-sdk';
import { buildPortfolioSystemPrompt } from './portfolio-context';

export interface ChatMessage {
  role: string;
  content: string;
}

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const MAX_COMPLETION_TOKENS = 2048;

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
  const systemPrompt = buildPortfolioSystemPrompt(locale);

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.map(msg => ({
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

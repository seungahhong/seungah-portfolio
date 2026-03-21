import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { buildPortfolioSystemPrompt } from './portfolio-context';

export interface ChatMessage {
  role: string;
  content: string;
}

function createGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

function createGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }
  return new Groq({ apiKey });
}

async function streamGemini(
  message: string,
  history: ChatMessage[],
  locale: string
): Promise<ReadableStream<Uint8Array>> {
  const genAI = createGeminiClient();
  const systemInstruction = buildPortfolioSystemPrompt(locale);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    systemInstruction,
  });

  const geminiHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessageStream(message);

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
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

async function streamGroq(
  message: string,
  history: ChatMessage[],
  locale: string
): Promise<ReadableStream<Uint8Array>> {
  const groq = createGroqClient();
  const systemPrompt = buildPortfolioSystemPrompt(locale);

  const groqMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content,
    })),
    { role: 'user' as const, content: message },
  ];

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: groqMessages,
    stream: true,
    max_completion_tokens: 2048,
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

export async function streamChatResponse(
  message: string,
  history: ChatMessage[],
  locale: string = 'ko'
): Promise<ReadableStream<Uint8Array>> {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasGroq = !!process.env.GROQ_API_KEY;

  // Try Gemini first, fallback to Groq on error
  if (hasGemini) {
    try {
      return await streamGemini(message, history, locale);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('Gemini failed, attempting Groq fallback:', errMsg);

      if (hasGroq) {
        return await streamGroq(message, history, locale);
      }
      throw err;
    }
  }

  // Groq only
  if (hasGroq) {
    return await streamGroq(message, history, locale);
  }

  throw new Error('No AI provider configured');
}

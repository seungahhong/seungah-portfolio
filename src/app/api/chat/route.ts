import { NextRequest, NextResponse } from 'next/server';
import { streamChatResponse } from '../../../lib/chat/gemini';

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_HISTORY = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  entry.count++;
  return false;
}

export async function GET() {
  const available = !!process.env.GEMINI_API_KEY || !!process.env.GROQ_API_KEY;
  return NextResponse.json({ available });
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
      return NextResponse.json({ available: false }, { status: 503 });
    }

    const { message, history, locale } = await req.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (Array.isArray(history) && history.length > MAX_HISTORY) {
      return NextResponse.json(
        { error: 'Conversation history too long. Please start a new conversation.' },
        { status: 400 }
      );
    }

    const safeHistory = Array.isArray(history) ? history : [];
    const safeLocale = typeof locale === 'string' ? locale : 'ko';

    const stream = await streamChatResponse(message.trim(), safeHistory, safeLocale);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);

    // Forward Gemini quota/rate limit errors as 429
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('Too Many Requests')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}

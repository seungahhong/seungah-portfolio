import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// 레이트리밋은 이 프로세스의 메모리에만 있다 — 서버리스에서는 인스턴스마다 카운터가 따로 있어
// 실제 허용량이 (한도 × 인스턴스 수)가 되고 재배포하면 초기화된다. 알면서 수용한 트레이드오프다.
// 근거와 재검토 조건: docs/decisions/0004-in-memory-rate-limit.md
// 이 계약을 지키는 검사는 verify:runtime V8이며, 케이스마다 x-forwarded-for를 바꿔야 가짜 실패가 나지 않는다.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

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

function sanitizeName(name: string): string {
  return name.replace(/[\r\n]/g, '').trim().slice(0, 100);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { name, email, message } = await req.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: 'Valid email is required' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ ok: false, error: 'Message must be at least 10 characters' }, { status: 400 });
    }

    const sanitizedName = sanitizeName(name);

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return NextResponse.json(
        { ok: false, error: 'Email service not configured', fallback: true },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${sanitizedName}" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `${sanitizedName} - 홍승아 포트폴리오 통한 연락`,
      text: message.trim() + `\n\n보내는 사람 이메일: ${email}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

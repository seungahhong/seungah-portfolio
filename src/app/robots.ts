import type { MetadataRoute } from 'next';
import { SITE_URL, absoluteUrl } from '@/lib/seo';

/**
 * AI 검색엔진에 인용되려면 먼저 크롤링이 허용되어야 한다.
 * 전통 검색 봇과 생성형 AI 봇을 모두 명시적으로 허용한다.
 */
const AI_CRAWLERS = [
  // OpenAI
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Anthropic
  'ClaudeBot',
  'Claude-Web',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Google / Apple / Meta / Amazon
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'meta-externalagent',
  'Amazonbot',
  // Common Crawl (다수 LLM 학습 데이터 출처)
  'CCBot',
  // Mistral / You.com / Bytedance
  'MistralAI-User',
  'YouBot',
  'Bytespider',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // `/contact`은 robots로 막지 않는다 — 크롤링을 차단하면 해당 페이지의
        // noindex 메타를 읽지 못해 색인에서 빠지지 않는다.
        disallow: ['/api/'],
      },
      {
        userAgent: AI_CRAWLERS,
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}

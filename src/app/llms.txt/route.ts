import { buildLlmsTxt } from '@/lib/seo/llms';

/** 정적 데이터만 사용하므로 빌드 시점에 생성해 캐시한다 */
export const dynamic = 'force-static';

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

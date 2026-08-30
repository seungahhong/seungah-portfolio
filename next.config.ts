import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * 산출물 디렉터리를 환경변수로 가를 수 있게 둔다(기본 `.next`).
   *
   * E2E는 `pnpm build && pnpm start`를 직접 부르는데, 그때 `pnpm dev`가 떠 있으면
   * 두 프로세스가 같은 `.next`를 동시에 쓰며 서로의 청크를 덮는다.
   * 실제로 그 경합으로 [AC-5.9]가 한 번 타임아웃했다.
   * playwright.config.ts가 NEXT_DIST_DIR로 자기 디렉터리를 쓰게 해 공유 상태를 없앤다.
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

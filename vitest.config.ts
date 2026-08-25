import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/**
 * 계층을 project로 물리 분리한다 — unit은 DOM이 필요 없고, 섞으면 unit이 jsdom 비용을 문다.
 *
 * 테스트는 대상 파일이 있는 폴더의 `__test__/`에 둔다(배치 규약).
 * `describe`/`it`/`expect`는 전역이 아니라 `vitest`에서 import한다 —
 * 전역을 쓰면 tsconfig에 `types: ["vitest/globals"]`가 필요한데,
 * `next build`가 tsconfig.json을 재작성하므로 그 항목이 살아남는다는 보장이 없다.
 */
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/{lib,helpers}/**/__test__/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/{components,hooks}/**/__test__/**/*.test.{ts,tsx}'],
        },
      },
    ],
  },
});

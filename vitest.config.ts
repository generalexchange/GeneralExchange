import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Scoped to the shared compute packages. The Next.js UI is not unit-tested here
// (it has no test suite today); this config exists for the deterministic,
// framework-free logic in packages/.
export default defineConfig({
  resolve: {
    alias: {
      '@gx/analytics': path.resolve(__dirname, 'packages/analytics/src'),
    },
  },
  test: {
    include: ['packages/**/tests/**/*.test.ts'],
    environment: 'node',
  },
});

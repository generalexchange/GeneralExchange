import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Tauri expects a fixed dev port and serves the built assets from dist/.
// 1420 is the Tauri convention; HMR over the websocket uses the same host.
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@gx/analytics': path.resolve(__dirname, '../../packages/analytics/src'),
    },
  },
  // Prevent Vite from obscuring Rust errors.
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
    watch: {
      // Don't watch the Rust source tree.
      ignored: ['**/src-tauri/**'],
    },
  },
  // Produce a build the Tauri webview can load from the bundled dist/.
  build: {
    target: 'es2021',
    minify: 'esbuild',
    sourcemap: false,
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  // GitHub Pages: 仓库名为 Test-1, 对应 https://<user>.github.io/Test-1/
  // 可通过环境变量 VITE_BASE 覆盖 (例如 CI 中传 '/' 用于自定义域名)
  base: process.env.VITE_BASE ?? '/Test-1/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});

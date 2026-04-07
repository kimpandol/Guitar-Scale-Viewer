import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // 🚀 추가된 부분: 상대 경로로 만들어줌!
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // (minify: 'terser' 지운 건 그대로 유지)
    sourcemap: false,
  },
  server: {
    port: 3000,
    open: true,
  },
});
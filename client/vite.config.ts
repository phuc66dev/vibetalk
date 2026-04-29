import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: "/",
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      // Dùng import.meta.url (ESM) thay vì __dirname (CJS) — không cần @types/node
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});

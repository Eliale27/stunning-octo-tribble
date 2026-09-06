import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// SINGLE_FILE=1 produces one JS chunk so the app can be inlined into a single HTML page.
const single = process.env.SINGLE_FILE === '1'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: single ? { outDir: 'dist-single', cssCodeSplit: false, rollupOptions: { output: { inlineDynamicImports: true } } } : undefined,
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})

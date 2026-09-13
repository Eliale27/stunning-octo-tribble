import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:8787', changeOrigin: true } },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts'
          if (id.includes('node_modules/pdfjs-dist') || id.includes('node_modules/mammoth')) return 'parsers'
          if (id.includes('node_modules/@anthropic-ai')) return 'anthropic'
          if (/node_modules\/(react|react-dom|react-router|zustand|scheduler)\//.test(id)) return 'vendor'
          return undefined
        },
      },
    },
  },
})

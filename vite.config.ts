import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 상대 경로로 빌드
  worker: {
    format: 'iife'
  },
  build: {
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  define: {
    global: 'globalThis'
  }
})

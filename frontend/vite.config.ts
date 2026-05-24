import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy /api/* → Spring Boot (which has context-path: /api)
      // So /api/auth/login → http://localhost:8080/api/auth/login  ✓
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Do NOT rewrite — keep /api prefix, Spring Boot expects it
      },
      // Proxy /ai/* → FastAPI (strip /ai prefix, FastAPI root is /)
      '/ai': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/ai/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query:  ['@tanstack/react-query'],
          charts: ['recharts'],
        },
      },
    },
  },
})

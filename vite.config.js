import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/deva-anime-react/dist/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost/deva-anime',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/deva-api': {
        target: 'http://localhost/deva-anime',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deva-api/, ''),
      },
    },
  },
})

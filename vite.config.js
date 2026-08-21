import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Apne backend ka port yahan likhein (jaise 5000 ya 8000)
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
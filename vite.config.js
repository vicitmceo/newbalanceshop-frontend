import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_API_URL || 'https://newbalanceshop-api.onrender.com'
  return {
    plugins: [react()],
    // у розробці /api проксується на сервер, так само як це робить Vercel на проді
    server: { proxy: { '/api': { target: backend, changeOrigin: true } } },
  }
})

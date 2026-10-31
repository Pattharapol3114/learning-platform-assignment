import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // The Vercel API does not send CORS headers, so in dev we proxy /api
      // through Vite to keep requests same-origin from the browser's view.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'https://learning-platform-api-five.vercel.app',
          changeOrigin: true,
        },
      },
    },
  }
})

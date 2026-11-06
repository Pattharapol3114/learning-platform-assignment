import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
    },
    server: {
      // Dev requests stay same-origin and are forwarded to the Vercel API,
      // so local development doesn't depend on the API's CORS allowlist.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'https://learning-platform-api-five.vercel.app',
          changeOrigin: true,
        },
      },
    },
  }
})

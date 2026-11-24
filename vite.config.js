import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiPrefix = (env.VITE_API_PREFIX || '/api').replace(/\/+$/, '')
  const proxy = {}
  if (!/^https?:\/\//i.test(apiPrefix)) {
    if (!apiPrefix.startsWith('/') || apiPrefix.startsWith('//')) {
      throw new Error('VITE_API_PREFIX 需要以 / 开头的 API 路径或完整的 HTTP(S) 地址')
    }
    proxy[apiPrefix] = { target: env.DEV_API_TARGET || 'http://127.0.0.1:8080', changeOrigin: true }
  }
  return {
    base: env.VITE_APP_BASE || '/aisol-env-booking-web/',
    plugins: [vue()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: { host: '127.0.0.1', proxy },
    build: { outDir: 'dist', assetsDir: 'static' },
  }
})

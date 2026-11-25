import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode, command, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiPrefix = (env.VITE_API_PREFIX || env.VUE_APP_BASE_API).replace(/\/+$/, '')
  const proxy = {}
  if (!/^https?:\/\//i.test(apiPrefix)) {
    if (!apiPrefix.startsWith('/') || apiPrefix.startsWith('//')) {
      throw new Error('API 前缀需要以 / 开头，或使用完整的 HTTP(S) 地址')
    }
    proxy[apiPrefix] = {
      target: env.DEV_API_TARGET || env.VUE_APP_BASE_API_TARGET,
      changeOrigin: true,
    }
  }

  return {
    base: command === 'build' ? './' : env.VITE_APP_BASE,
    plugins: [vue()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    define: {
      'import.meta.env.APP_NAME': JSON.stringify(env.VUE_APP_NAME),
      'import.meta.env.APP_CACHE_KEY': JSON.stringify(env.VUE_APP_CACHE_KEY),
      'import.meta.env.APP_API_PREFIX': JSON.stringify(apiPrefix),
      'import.meta.env.APP_ENTRY': JSON.stringify(env.VITE_APP_BASE),
    },
    server: { host: '127.0.0.1', proxy },
    preview: isPreview ? { proxy } : {},
    build: { outDir: 'dist', assetsDir: 'static' },
  }
})

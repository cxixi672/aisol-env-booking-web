import { useAppStore } from '@/stores/app'
import { siteName } from '@/config'

export async function bootstrap(app, router) {
  const store = useAppStore()
  document.title = siteName
  const preference = window.matchMedia('(prefers-color-scheme: dark)')
  const applyTheme = () => {
    store.dark = preference.matches
    document.documentElement.dataset.theme = store.dark ? 'dark' : 'light'
  }
  applyTheme()
  preference.addEventListener('change', applyTheme)
  await router.isReady()
  app.mount('#app')
}

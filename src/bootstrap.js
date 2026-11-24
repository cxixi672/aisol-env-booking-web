import { useAppStore } from '@/stores/app'

export async function bootstrap(app, router) {
  const store = useAppStore()
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

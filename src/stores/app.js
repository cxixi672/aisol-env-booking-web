import { defineStore } from 'pinia'
import { cacheKey, environments, users } from '@/config'

export const useAppStore = defineStore('app', {
  state: () => {
    const env = sessionStorage.getItem(`${cacheKey}.env`)
    const user = sessionStorage.getItem(`${cacheKey}.user`)
    return {
      dark: false,
      env: environments.includes(env) ? env : environments[0],
      user: users.includes(user) ? user : users[0],
    }
  },
  actions: {
    setEnv(env) {
      this.env = env
      sessionStorage.setItem(`${cacheKey}.env`, env)
    },
    setUser(user) {
      this.user = user
      sessionStorage.setItem(`${cacheKey}.user`, user)
    },
  },
})

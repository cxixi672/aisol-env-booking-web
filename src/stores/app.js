import { defineStore } from 'pinia'

export const environments = ['env-a', 'env-b']
export const users = ['alice', 'bob', 'carol', 'admin']

export const useAppStore = defineStore('app', {
  state: () => {
    const env = sessionStorage.getItem('booking.env')
    const user = sessionStorage.getItem('booking.user')
    return {
      dark: false,
      env: environments.includes(env) ? env : environments[0],
      user: users.includes(user) ? user : users[0],
    }
  },
  actions: {
    setEnv(env) {
      this.env = env
      sessionStorage.setItem('booking.env', env)
    },
    setUser(user) {
      this.user = user
      sessionStorage.setItem('booking.user', user)
    },
  },
})

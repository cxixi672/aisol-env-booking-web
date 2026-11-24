import axios from 'axios'
import { useAppStore } from '@/stores/app'

const client = axios.create({ baseURL: import.meta.env.VITE_API_PREFIX || '/api', timeout: 30000 })

export class BusinessResponseError extends Error {
  constructor(code, desc) {
    super(typeof desc === 'string' && desc.trim() ? desc : '请求失败')
    this.code = code
  }
}

client.interceptors.response.use(response => {
  const result = response.data
  if (typeof result?.code !== 'string' || !result.code.trim()) {
    throw new Error('服务响应格式错误')
  }
  if (result.code === '000000') return result
  throw new BusinessResponseError(result.code, result.desc)
})

export const useAxios = config => client.request({
  ...config,
  headers: { 'X-User': useAppStore().user, ...config.headers },
})

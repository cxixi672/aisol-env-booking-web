import axios from 'axios'

const client = axios.create({ baseURL: import.meta.env.VITE_API_PREFIX || '/api', timeout: 30000 })

client.interceptors.response.use(response => {
  const result = response.data
  if (result?.code === '000000') return result
  const error = new Error(result?.desc || result?.message || '请求失败')
  error.code = result?.code
  throw error
}, error => {
  const result = error.response?.data
  if (result?.desc) error.message = result.desc
  return Promise.reject(error)
})

export const useAxios = config => client.request(config)

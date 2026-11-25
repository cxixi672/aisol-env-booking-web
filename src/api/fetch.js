import axios from 'axios'

const client = axios.create({ baseURL: import.meta.env.APP_API_PREFIX, timeout: 30000 })

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

export function useAxios({ url, data, user, key, signal }) {
  const headers = { 'X-User': user, 'Content-Type': 'application/json' }
  if (key) headers['Idempotency-Key'] = key
  return client.post(url, data, { headers, signal })
}

export function decimalIdBody(id) {
  // The server returns int64 IDs as strings. Keep every digit in the JSON number.
  const digits = String(id)
  if (!/^[1-9][0-9]*$/.test(digits)) throw new Error('记录编号无效')
  return digits
}

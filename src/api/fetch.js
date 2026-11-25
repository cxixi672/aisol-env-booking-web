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
  if (typeof id !== 'string' && typeof id !== 'bigint' && !Number.isSafeInteger(id)) {
    throw new Error('记录编号无效')
  }
  const digits = String(id)
  if (!/^[1-9][0-9]{0,18}$/.test(digits) || BigInt(digits) > 9_223_372_036_854_775_807n) {
    throw new Error('记录编号无效')
  }
  // Axios preserves valid JSON text. Keep the server's string ID exact on the wire.
  return `{"id":${digits}}`
}

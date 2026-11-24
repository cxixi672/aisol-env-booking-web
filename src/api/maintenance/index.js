import { useAxios } from '@/api/fetch'

export function listMaintenance(params) {
  return useAxios({ url: '/maintenance', method: 'get', params })
}

export function createMaintenance(data, key) {
  return useAxios({
    url: '/maintenance',
    method: 'post',
    data,
    headers: { 'Idempotency-Key': key },
  })
}

export function cancelMaintenance(id) {
  return useAxios({ url: `/maintenance/${encodeURIComponent(id)}`, method: 'delete' })
}

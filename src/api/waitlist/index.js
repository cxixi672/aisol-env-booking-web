import { useAxios } from '@/api/fetch'

export function listWaitlist(params) {
  return useAxios({ url: '/waitlist', method: 'GET', params })
}

export function createWaitlist(data, key) {
  return useAxios({
    url: '/waitlist',
    method: 'POST',
    headers: { 'Idempotency-Key': key },
    data,
  })
}

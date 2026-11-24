import { useAxios } from '@/api/fetch'

export function listBookings(params) {
  return useAxios({ url: '/bookings', method: 'GET', params })
}

export function createBooking(data, key) {
  return useAxios({
    url: '/bookings',
    method: 'POST',
    headers: { 'Idempotency-Key': key },
    data,
  })
}

export function cancelBooking(id) {
  return useAxios({ url: `/bookings/${encodeURIComponent(id)}`, method: 'DELETE' })
}

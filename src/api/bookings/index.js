import { decimalIdBody, useAxios } from '@/api/fetch'

/** Load records for an environment and UTC interval as the selected user. */
export function listBookings(data, user, signal) {
  return useAxios({ url: '/bookings/list', data, user, signal })
}

/** Create a record with the key assigned to this user and interval. */
export function createBooking(data, user, key) {
  return useAxios({ url: '/bookings/create', data, user, key })
}

/** Cancel the record identified by a numeric JSON body. */
export function cancelBooking(id, user) {
  return useAxios({ url: '/bookings/cancel', data: decimalIdBody(id), user })
}

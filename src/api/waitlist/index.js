import { useAxios } from '@/api/fetch'

/** Load records for an environment and UTC interval as the selected user. */
export function listWaitlist(data, user, signal) {
  return useAxios({ url: '/waitlist/list', data, user, signal })
}

/** Create a record with the key assigned to this user and interval. */
export function createWaitlist(data, user, key) {
  return useAxios({ url: '/waitlist/create', data, user, key })
}

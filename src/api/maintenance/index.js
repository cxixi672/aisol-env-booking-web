import { decimalIdBody, useAxios } from '@/api/fetch'

/** Load records for an environment and UTC interval as the selected user. */
export function listMaintenance(data, user, signal) {
  return useAxios({ url: '/maintenance/list', data, user, signal })
}

/** Create a record with the key assigned to this user and interval. */
export function createMaintenance(data, user, key) {
  return useAxios({ url: '/maintenance/create', data, user, key })
}

/** Cancel the record with an int64 ID field in the JSON body. */
export function cancelMaintenance(id, user) {
  return useAxios({ url: '/maintenance/cancel', data: decimalIdBody(id), user })
}

import { BusinessResponseError } from '@/api/fetch'

// These codes confirm that this submission did not create a record.
const rejectionCodes = new Set([
  'INVALID_INPUT',
  'FORBIDDEN',
  'NOT_FOUND',
  'BOOKING_CONFLICT',
  'MAINTENANCE_CONFLICT',
  'SLOT_AVAILABLE',
  'ALREADY_WAITING',
  'KEY_REUSED',
])

function newIdempotencyKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function createIdempotentSubmission(submit) {
  const pendingKeys = new Map()

  return async (user, payload) => {
    const signature = JSON.stringify([user, payload.env, payload.start, payload.end])
    const key = pendingKeys.get(signature) ?? newIdempotencyKey()
    pendingKeys.set(signature, key)

    try {
      const result = await submit(payload, key)
      pendingKeys.delete(signature)
      return result
    } catch (error) {
      if (error instanceof BusinessResponseError && rejectionCodes.has(error.code)) {
        pendingKeys.delete(signature)
      }
      throw error
    }
  }
}

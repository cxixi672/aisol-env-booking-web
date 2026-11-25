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
  const pending = new Map()

  return (user, payload) => {
    const signature = JSON.stringify([user, payload.env, payload.start, payload.end])
    const attempt = pending.get(signature) ?? { key: newIdempotencyKey(), request: null }
    if (attempt.request) return attempt.request

    pending.set(signature, attempt)
    attempt.request = Promise.resolve()
      .then(() => submit(payload, user, attempt.key))
      .then(result => {
        pending.delete(signature)
        return result
      })
      .catch(error => {
        if (error instanceof BusinessResponseError && rejectionCodes.has(error.code)) pending.delete(signature)
        throw error
      })
      .finally(() => {
        attempt.request = null
      })
    return attempt.request
  }
}

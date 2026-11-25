export const rangeFormatError = '请输入有效的 UTC 时间，格式为 YYYY-MM-DDTHH:mm:ssZ。'
export const rangeOrderError = '结束时间须晚于开始时间。'

function toUtc(value, localInput) {
  const text = value.trim()
  const timestamp = localInput ? (text.length === 16 ? `${text}:00Z` : `${text}Z`) : text
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(timestamp)) return null
  const date = new Date(timestamp)
  return Number.isFinite(date.getTime()) && date.toISOString() === timestamp.replace('Z', '.000Z')
    ? timestamp
    : null
}

export function parseRange({ start, end }, localInput = false) {
  if (typeof start !== 'string' || typeof end !== 'string') return { error: rangeFormatError }
  const from = toUtc(start, localInput)
  const to = toUtc(end, localInput)
  if (!from || !to) return { error: localInput ? '请填写有效的 UTC 起止时间。' : rangeFormatError }
  if (from >= to) return { error: rangeOrderError }
  return { range: { start: from, end: to } }
}

export function inputRange({ start, end }, localInput) {
  return localInput ? { start: start.slice(0, -1), end: end.slice(0, -1) } : { start, end }
}

export function currentUtcDay() {
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return {
    start: start.toISOString().replace('.000Z', 'Z'),
    end: end.toISOString().replace('.000Z', 'Z'),
  }
}

export function savedRange(key, localInput) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key))
    const parsed = saved && parseRange(saved, localInput)
    if (parsed?.range) return parsed.range
  } catch {
    // Fall back to the default UTC day when an older session value is unreadable.
  }
  return currentUtcDay()
}

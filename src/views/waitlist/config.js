import { cacheKey } from '@/config'

export const storagePrefix = `${cacheKey}.waitlist`

export const fields = {
  startId: 'waitlist-start',
  endId: 'waitlist-end',
  startLabel: '开始时间 (UTC)',
  endLabel: '结束时间 (UTC)',
  startPlaceholder: '2030-01-02T10:00:00Z',
  endPlaceholder: '2030-01-02T11:00:00Z',
}

export const columns = [
  { title: '候补 ID', dataIndex: 'id' },
  { title: '开始时间 (UTC)', dataIndex: 'start' },
  { title: '结束时间 (UTC)', dataIndex: 'end' },
  { title: '状态', dataIndex: 'status' },
  { title: '预约 ID', dataIndex: 'bookingId' },
]

export const statuses = {
  waiting: { label: '候补中', color: 'blue' },
  promoted: { label: '已递补', color: 'green' },
}

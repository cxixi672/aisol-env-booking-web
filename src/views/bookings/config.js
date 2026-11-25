import { cancelBooking, createBooking, listBookings } from '@/api/bookings'
import { cacheKey } from '@/config'
import { canCancelBooking } from '@/config/permissions'
import { createIdempotentSubmission } from '@/utils/idempotency'

export default {
  title: '预约与取消',
  addText: '新建预约',
  editTitle: () => '新建预约',
  submitText: '提交预约',
  createdText: id => `预约成功 · 编号 ${id}`,
  cancelText: '取消预约',
  cancelTitle: record => `取消预约 ${record.id}？`,
  confirmCancelText: '确认取消',
  keepText: '保留预约',
  cancelledText: id => `预约已取消 · 编号 ${id}`,
  emptyText: '该时段暂无预约',
  loadFailedText: '预约列表加载失败',
  storageKey: `${cacheKey}.query`,
  localInput: true,
  tableWidth: 740,
  searchFields: {
    startId: 'booking-query-start',
    endId: 'booking-query-end',
    startLabel: '开始时间（UTC）',
    endLabel: '结束时间（UTC）',
  },
  editFields: {
    startId: 'booking-start',
    endId: 'booking-end',
    startLabel: '预约开始时间（UTC）',
    endLabel: '预约结束时间（UTC）',
  },
  columns: [
    { title: '预约编号', dataIndex: 'id' },
    { title: '环境', dataIndex: 'env' },
    { title: '开始（UTC）', dataIndex: 'start' },
    { title: '结束（UTC）', dataIndex: 'end' },
    { title: '预约人', dataIndex: 'user' },
    { title: '操作', key: 'action' },
  ],
  list: listBookings,
  create: createIdempotentSubmission(createBooking),
  cancel: cancelBooking,
  canCreate: () => true,
  canCancel: canCancelBooking,
}

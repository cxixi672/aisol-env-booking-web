import { cancelMaintenance, createMaintenance, listMaintenance } from '@/api/maintenance'
import { cacheKey } from '@/config'
import { canManageMaintenance } from '@/config/permissions'
import { createIdempotentSubmission } from '@/utils/idempotency'

export default {
  title: '维护窗口',
  addText: '创建维护',
  editTitle: env => `创建维护 · ${env}`,
  submitText: '创建',
  createdText: id => `维护窗口已创建 · 编号 ${id}`,
  cancelText: '撤销',
  cancelTitle: record => `撤销维护窗口 · ${record.env} · ${record.start} 至 ${record.end}`,
  confirmCancelText: '撤销维护',
  keepText: '返回',
  cancelledText: () => '维护窗口已撤销',
  emptyText: '该时段暂无维护窗口',
  loadFailedText: '维护列表加载失败',
  storageKey: cacheKey === 'booking' ? 'maintenance.query' : `${cacheKey}.maintenance.query`,
  localInput: false,
  tableWidth: 690,
  searchFields: {
    startId: 'maintenance-filter-start',
    endId: 'maintenance-filter-end',
    startLabel: '开始时间 (UTC)',
    endLabel: '结束时间 (UTC)',
  },
  editFields: {
    startId: 'maintenance-create-start',
    endId: 'maintenance-create-end',
    startLabel: '维护开始 (UTC)',
    endLabel: '维护结束 (UTC)',
  },
  columns: [
    { title: '维护编号', dataIndex: 'id' },
    { title: '环境', dataIndex: 'env' },
    { title: '开始时间 (UTC)', dataIndex: 'start' },
    { title: '结束时间 (UTC)', dataIndex: 'end' },
    { title: '创建人', dataIndex: 'user' },
    { title: '操作', key: 'action', width: 110 },
  ],
  list: listMaintenance,
  create: createIdempotentSubmission(createMaintenance),
  cancel: cancelMaintenance,
  canCreate: canManageMaintenance,
  canCancel: ({ user, env }, record) => canManageMaintenance(user) && record.env === env,
}

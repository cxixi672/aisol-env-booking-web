export default {
  path: 'maintenance',
  name: 'Maintenance',
  meta: { title: '维护窗口', order: 2 },
  component: () => import('@/views/maintenance/index.vue'),
}

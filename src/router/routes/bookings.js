export default {
  path: 'bookings',
  name: 'Bookings',
  meta: { title: '预约与取消', order: 1 },
  component: () => import('@/views/bookings/index.vue'),
}

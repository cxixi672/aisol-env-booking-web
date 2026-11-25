export default {
  path: 'waitlist',
  name: 'Waitlist',
  meta: { title: '候补队列', order: 3 },
  component: () => import('@/views/waitlist/index.vue'),
}

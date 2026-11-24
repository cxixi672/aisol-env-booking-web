import { h } from 'vue'

const slicePages = import.meta.glob('../views/{maintenance,waitlist}/index.vue')

function slicePage(path, title) {
  // Each companion branch adds its own index.vue when integrated.
  return slicePages[path] ?? {
    render: () => h('section', [h('h1', title), h('p', '该页面将在对应功能合入后开放。')]),
  }
}

export const pages = [
  {
    path: 'bookings',
    name: 'Bookings',
    meta: { title: '预约与取消' },
    component: () => import('@/views/bookings/index.vue'),
  },
  {
    path: 'maintenance',
    name: 'Maintenance',
    meta: { title: '维护窗口' },
    component: slicePage('../views/maintenance/index.vue', '维护窗口'),
  },
  {
    path: 'waitlist',
    name: 'Waitlist',
    meta: { title: '候补队列' },
    component: slicePage('../views/waitlist/index.vue', '候补队列'),
  },
]

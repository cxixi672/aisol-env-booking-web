import { createRouter, createWebHistory } from 'vue-router'
import BaseTopSide from '@/layout/BaseTopSide.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{
    path: '/',
    component: BaseTopSide,
    children: [{
      path: '',
      name: 'SystemStatus',
      meta: { title: '服务状态' },
      component: () => import('@/views/system/Status.vue'),
    }],
  }],
})

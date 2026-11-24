import { createRouter, createWebHistory } from 'vue-router'
import BaseTopSide from '@/layout/BaseTopSide.vue'
import { pages } from './pages'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{
    path: '/',
    component: BaseTopSide,
    children: [{ path: '', redirect: { name: 'Bookings' } }, ...pages],
  }],
})

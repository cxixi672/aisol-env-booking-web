import { createRouter, createWebHashHistory } from 'vue-router'
import BaseTopSide from '@/layout/BaseTopSide.vue'
import { pages } from './routes'

// Vite and gateways with the former history fallback can still open old bookmarks.
const entry = import.meta.env.APP_ENTRY
if (!location.hash && location.pathname.startsWith(entry)) {
  const path = location.pathname.slice(entry.length).replace(/\/$/, '')
  if (pages.some(page => page.path === path)) {
    history.replaceState(history.state, '', `${entry}${location.search}#/${path}`)
  }
}

export default createRouter({
  history: createWebHashHistory(),
  routes: [{
    path: '/',
    component: BaseTopSide,
    children: [
      { path: '', redirect: { name: 'Bookings' } },
      ...pages,
      { path: ':pathMatch(.*)*', redirect: { name: 'Bookings' } },
    ],
  }],
})

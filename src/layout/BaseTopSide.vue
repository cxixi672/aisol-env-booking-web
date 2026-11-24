<script setup>
import { environments, users, useAppStore } from '@/stores/app'
import { pages } from '@/router/pages'

const app = useAppStore()
</script>

<template>
  <a-layout class="app-layout">
    <header class="app-header">
      <div class="header-inner">
        <router-link :to="{ name: 'Bookings' }" class="brand">共享联调环境预约台</router-link>
        <div class="context-selectors">
          <label>
            环境
            <select id="booking-env" :value="app.env" @change="app.setEnv($event.target.value)">
              <option v-for="env in environments" :key="env" :value="env">{{ env }}</option>
            </select>
          </label>
          <label>
            当前身份
            <select id="booking-user" :value="app.user" @change="app.setUser($event.target.value)">
              <option v-for="user in users" :key="user" :value="user">{{ user }}</option>
            </select>
          </label>
        </div>
      </div>
    </header>
    <nav class="app-nav" aria-label="功能导航">
      <div class="nav-inner">
        <router-link v-for="page in pages" :key="page.name" :to="{ name: page.name }">
          {{ page.meta.title }}
        </router-link>
      </div>
    </nav>
    <a-layout-content class="app-content">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<style scoped>
.header-inner, .nav-inner {
  width: min(100%, 72rem);
  margin-inline: auto;
  padding-inline: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.header-inner {
  min-height: 68px;
  padding-block: 12px;
  justify-content: space-between;
  flex-wrap: wrap;
}
.brand {
  color: inherit;
  font-size: 19px;
  font-weight: 650;
}
.context-selectors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}
.context-selectors label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.context-selectors select {
  padding: 5px 9px;
  color: var(--app-header-text);
  background: var(--app-header-bg);
  border: 1px solid #7890a7;
  border-radius: 6px;
  font: inherit;
}
.app-nav {
  background: var(--app-panel-bg);
  border-bottom: 1px solid var(--app-border);
}
.nav-inner {
  gap: 8px 24px;
  flex-wrap: wrap;
}
.nav-inner a {
  padding-block: 14px 12px;
  color: var(--app-text);
  border-bottom: 3px solid transparent;
}
.nav-inner a.router-link-exact-active {
  color: var(--app-accent);
  border-bottom-color: currentColor;
  font-weight: 600;
}
</style>

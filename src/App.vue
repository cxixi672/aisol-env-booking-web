<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { theme } from 'ant-design-vue'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
</script>

<template>
  <a-config-provider :locale="zhCN" :theme="{ algorithm: app.dark ? theme.darkAlgorithm : theme.defaultAlgorithm }">
    <router-view />
  </a-config-provider>
</template>

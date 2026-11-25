<script>
import { mapState } from 'pinia'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useAppStore } from '@/stores/app'
import { adminTheme } from '@/config/theme'

export default {
  name: 'BookingApp',
  data: () => ({ zhCN }),
  computed: {
    ...mapState(useAppStore, ['dark']),
    theme() {
      return adminTheme(this.dark)
    },
  },
}
</script>

<template>
  <a-config-provider :locale="zhCN" :theme="theme">
    <router-view />
  </a-config-provider>
</template>

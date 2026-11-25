<script>
import WindowList from '@/components/windows/WindowList.vue'
import config from './config'

export default {
  name: 'MaintenanceListPage',
  components: { WindowList },
  data: () => ({ config }),
}
</script>

<template>
  <WindowList :config="config" />
</template>

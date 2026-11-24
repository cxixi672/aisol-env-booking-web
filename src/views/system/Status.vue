<script setup>
import { onMounted, ref } from 'vue'
import { getSystemStatus } from '@/api/system'

const loading = ref(false)
const detail = ref(null)
const error = ref('')

async function refresh() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    detail.value = (await getSystemStatus()).data
  } catch (cause) {
    detail.value = null
    error.value = cause.message
  } finally {
    loading.value = false
  }
}
onMounted(refresh)
</script>

<template>
  <a-card title="服务状态" :loading="loading">
    <template #extra><a-button :loading="loading" @click="refresh">刷新</a-button></template>
    <a-alert v-if="error" type="error" :message="error" show-icon />
    <a-descriptions v-else-if="detail" :column="1">
      <a-descriptions-item label="服务">{{ detail.service }}</a-descriptions-item>
      <a-descriptions-item label="数据库">{{ detail.database }}</a-descriptions-item>
    </a-descriptions>
  </a-card>
</template>

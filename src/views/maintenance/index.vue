<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { cancelMaintenance, createMaintenance, listMaintenance } from '@/api/maintenance'
import { useAppStore } from '@/stores/app'
import { newIdempotencyKey } from '@/utils/idempotency'

const context = useAppStore()
const canManage = computed(() => context.user === 'admin')
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setUTCDate(today.getUTCDate() + 1)
const filters = reactive({
  start: today.toISOString().slice(0, 10) + 'T00:00:00Z',
  end: tomorrow.toISOString().slice(0, 10) + 'T00:00:00Z',
})
const activeRange = ref({ ...filters })
const rows = ref([])
const loading = ref(false)
const filterError = ref('')
const listError = ref('')
const cancelling = ref(false)
const columns = [
  { title: '开始时间 (UTC)', dataIndex: 'start' },
  { title: '结束时间 (UTC)', dataIndex: 'end' },
  { title: '创建人', dataIndex: 'user' },
  { title: '操作', key: 'actions', width: 110 },
]
const visibleColumns = computed(() => canManage.value ? columns : columns.slice(0, -1))

const createOpen = ref(false)
const draft = reactive({ start: '', end: '' })
const creating = ref(false)
const createError = ref('')
let createContext
let attempt
let listVersion = 0

function isUtcTimestamp(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) return false
  const time = new Date(value)
  return !Number.isNaN(time.getTime()) && time.toISOString() === value.replace('Z', '.000Z')
}

function validateRange({ start, end }) {
  if (!isUtcTimestamp(start) || !isUtcTimestamp(end)) return '请输入 UTC 时间，格式为 YYYY-MM-DDTHH:mm:ssZ。'
  if (start >= end) return '结束时间必须晚于开始时间。'
  return ''
}

async function loadMaintenance() {
  const version = ++listVersion
  loading.value = true
  listError.value = ''
  rows.value = []
  try {
    const res = await listMaintenance({ env: context.env, ...activeRange.value })
    if (version === listVersion) rows.value = res.data ?? []
  } catch (err) {
    if (version === listVersion) listError.value = err.message
  } finally {
    if (version === listVersion) loading.value = false
  }
}

function search() {
  const range = { start: filters.start.trim(), end: filters.end.trim() }
  filterError.value = validateRange(range)
  if (filterError.value) return
  activeRange.value = range
  return loadMaintenance()
}

function openCreate() {
  createContext = { env: context.env, user: context.user }
  Object.assign(draft, activeRange.value)
  createError.value = ''
  createOpen.value = true
}

function isCurrentContext({ env, user }) {
  return context.env === env && context.user === user
}

async function submitCreate() {
  if (creating.value || !canManage.value || !isCurrentContext(createContext)) return
  const data = { env: createContext.env, start: draft.start.trim(), end: draft.end.trim() }
  createError.value = validateRange(data)
  if (createError.value) return

  const signature = JSON.stringify([createContext.user, data])
  if (attempt?.signature !== signature) attempt = { signature, key: newIdempotencyKey() }

  creating.value = true
  try {
    await createMaintenance(data, attempt.key)
    attempt = undefined
    createOpen.value = false
    message.success('维护窗口已创建')
    if (isCurrentContext(createContext)) await loadMaintenance()
  } catch (err) {
    if (isCurrentContext(createContext)) {
      createError.value = err.message
    } else {
      createOpen.value = false
      message.error(err.message)
    }
  } finally {
    creating.value = false
  }
}

function confirmCancel(record) {
  const originalContext = { env: context.env, user: context.user }
  Modal.confirm({
    title: '撤销维护窗口',
    content: `${record.env} · ${record.start} 至 ${record.end}`,
    okText: '撤销维护',
    okType: 'danger',
    cancelText: '返回',
    async onOk() {
      if (!isCurrentContext(originalContext) || !canManage.value) return
      cancelling.value = true
      try {
        await cancelMaintenance(record.id)
        message.success('维护窗口已撤销')
        if (isCurrentContext(originalContext)) await loadMaintenance()
      } catch (err) {
        message.error(err.message)
        throw err
      } finally {
        cancelling.value = false
      }
    },
  })
}

watch(() => [context.env, context.user], () => {
  if (!creating.value) createOpen.value = false
  loadMaintenance()
}, { immediate: true })
</script>

<template>
  <a-card title="维护窗口">
    <template #extra>
      <a-button v-if="canManage" type="primary" @click="openCreate">创建维护</a-button>
    </template>

    <a-form layout="inline" class="maintenance-filters" @finish="search">
      <a-form-item label="开始时间 (UTC)" html-for="maintenance-filter-start">
        <a-input id="maintenance-filter-start" v-model:value="filters.start" />
      </a-form-item>
      <a-form-item label="结束时间 (UTC)" html-for="maintenance-filter-end">
        <a-input id="maintenance-filter-end" v-model:value="filters.end" />
      </a-form-item>
      <a-form-item>
        <a-button html-type="submit" :loading="loading">查询</a-button>
      </a-form-item>
    </a-form>

    <a-alert v-if="filterError" :message="filterError" type="error" show-icon class="maintenance-error" />
    <a-alert v-if="listError" :message="listError" type="error" show-icon class="maintenance-error" />
    <a-table
      :columns="visibleColumns"
      :data-source="rows"
      :loading="loading"
      :pagination="false"
      row-key="id"
      :locale="{ emptyText: '该时段暂无维护窗口' }"
    >
      <template #bodyCell="{ column, record }">
        <a-button
          v-if="column.key === 'actions'"
          type="link"
          danger
          :disabled="cancelling"
          @click="confirmCancel(record)"
        >撤销</a-button>
      </template>
    </a-table>
  </a-card>

  <a-modal
    v-model:open="createOpen"
    :title="`创建维护 · ${createContext?.env || context.env}`"
    ok-text="创建"
    cancel-text="返回"
    :confirm-loading="creating"
    :cancel-button-props="{ disabled: creating }"
    :closable="!creating"
    :keyboard="!creating"
    :mask-closable="false"
    @ok="submitCreate"
  >
    <a-form layout="vertical" @finish="submitCreate">
      <a-form-item label="维护开始 (UTC)" html-for="maintenance-create-start">
        <a-input id="maintenance-create-start" v-model:value="draft.start" :disabled="creating" />
      </a-form-item>
      <a-form-item label="维护结束 (UTC)" html-for="maintenance-create-end">
        <a-input id="maintenance-create-end" v-model:value="draft.end" :disabled="creating" />
      </a-form-item>
    </a-form>
    <a-alert v-if="createError" :message="createError" type="error" show-icon />
  </a-modal>
</template>

<style scoped>
.maintenance-filters {
  row-gap: 12px;
  margin-bottom: 16px;
}

.maintenance-filters :deep(.ant-input) {
  width: 13rem;
}

.maintenance-error {
  margin-bottom: 12px;
}
</style>

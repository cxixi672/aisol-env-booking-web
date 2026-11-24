<script setup>
import { onScopeDispose, reactive, ref, watch } from 'vue'
import { createWaitlist, listWaitlist } from '@/api/waitlist'
import { useAppStore } from '@/stores/app'
import { newIdempotencyKey } from '@/utils/idempotency'

defineOptions({ name: 'Waitlist' })

const app = useAppStore()
const today = new Date().toISOString().slice(0, 10)
const tomorrow = new Date(Date.parse(today) + 86400000).toISOString().slice(0, 10)
const draft = reactive({
  start: sessionStorage.getItem('booking.waitlist.start') ?? today + 'T00:00:00Z',
  end: sessionStorage.getItem('booking.waitlist.end') ?? tomorrow + 'T00:00:00Z',
})
const rows = ref([])
const queriedSlot = ref(null)
const loading = ref(false)
const submitting = ref(false)
const formError = ref('')
const queryError = ref('')
const success = ref('')
const pendingKeys = new Map()
let queryVersion = 0
let contextVersion = 0

const columns = [
  { title: '候补 ID', dataIndex: 'id' },
  { title: '开始时间 (UTC)', dataIndex: 'start' },
  { title: '结束时间 (UTC)', dataIndex: 'end' },
  { title: '状态', dataIndex: 'status' },
  { title: '预约 ID', dataIndex: 'bookingId' },
]

function parseUtcSecond(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) return NaN
  const time = Date.parse(value)
  return Number.isFinite(time) && new Date(time).toISOString().replace('.000Z', 'Z') === value
    ? time
    : NaN
}

function readSlot() {
  formError.value = ''
  const start = draft.start.trim()
  const end = draft.end.trim()
  const startTime = parseUtcSecond(start)
  const endTime = parseUtcSecond(end)
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    formError.value = '请输入有效的 UTC 时间，格式为 YYYY-MM-DDTHH:mm:ssZ。'
    return null
  }
  if (startTime >= endTime) {
    formError.value = '结束时间须晚于开始时间。'
    return null
  }
  return { env: app.env, start, end }
}

async function loadWaitlist(slot) {
  const version = ++queryVersion
  sessionStorage.setItem('booking.waitlist.start', slot.start)
  sessionStorage.setItem('booking.waitlist.end', slot.end)
  loading.value = true
  queryError.value = ''
  try {
    const result = await listWaitlist(slot)
    if (version !== queryVersion) return
    rows.value = result.data
    queriedSlot.value = slot
  } catch (error) {
    if (version !== queryVersion) return
    queryError.value = error.message
  } finally {
    if (version === queryVersion) loading.value = false
  }
}

function refresh() {
  const slot = readSlot()
  if (slot) return loadWaitlist(slot)
}

async function submit() {
  if (submitting.value) return
  success.value = ''
  const slot = readSlot()
  if (!slot) return

  const user = app.user
  const version = contextVersion
  const request = JSON.stringify([user, slot.env, slot.start, slot.end])
  const key = pendingKeys.get(request) ?? newIdempotencyKey()
  pendingKeys.set(request, key)
  submitting.value = true
  try {
    await createWaitlist(slot, key)
    pendingKeys.delete(request)
    if (version !== contextVersion) return
    success.value = '已加入候补队列。'
    await loadWaitlist(slot)
  } catch (error) {
    const status = error.response?.status
    if (status >= 400 && status < 500) pendingKeys.delete(request)
    if (version === contextVersion) formError.value = error.message
  } finally {
    submitting.value = false
  }
}

watch([() => app.env, () => app.user], () => {
  ++contextVersion
  ++queryVersion
  rows.value = []
  queriedSlot.value = null
  loading.value = false
  queryError.value = ''
  success.value = ''
  refresh()
}, { immediate: true, flush: 'sync' })

onScopeDispose(() => {
  ++contextVersion
  ++queryVersion
})
</script>

<template>
  <div class="waitlist-page">
    <h1>候补与递补</h1>
    <a-card>
      <a-form :model="draft" layout="vertical" @finish="submit">
        <div class="waitlist-range">
          <a-form-item label="开始时间 (UTC)" html-for="waitlist-start">
            <a-input
              id="waitlist-start"
              v-model:value="draft.start"
              :disabled="submitting"
              placeholder="2030-01-02T10:00:00Z"
            />
          </a-form-item>
          <a-form-item label="结束时间 (UTC)" html-for="waitlist-end">
            <a-input
              id="waitlist-end"
              v-model:value="draft.end"
              :disabled="submitting"
              placeholder="2030-01-02T11:00:00Z"
            />
          </a-form-item>
        </div>
        <a-space wrap>
          <a-button type="primary" html-type="submit" :loading="submitting">加入候补</a-button>
          <a-button :loading="loading" :disabled="submitting" @click="refresh">查询候补</a-button>
        </a-space>
        <a-alert v-if="formError" class="waitlist-alert" type="error" :message="formError" show-icon />
        <a-alert v-if="success" class="waitlist-alert" type="success" :message="success" show-icon />
      </a-form>
    </a-card>
    <a-card title="我的候补">
      <a-alert v-if="queryError" class="waitlist-query-error" type="error" :message="queryError" show-icon />
      <p v-if="queriedSlot">查询区间 {{ queriedSlot.start }} 至 {{ queriedSlot.end }}</p>
      <a-table
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="false"
        :scroll="{ x: 640 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            <a-tag v-if="record.status === 'promoted'" color="green">已递补</a-tag>
            <a-tag v-else color="blue">候补中</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'bookingId'">
            {{ record.bookingId || '—' }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
.waitlist-page {
  display: grid;
  gap: 16px;
}

.waitlist-page h1 {
  margin: 0;
  font-size: 24px;
}

.waitlist-range {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 12px 16px;
  max-width: 640px;
}

.waitlist-alert {
  margin-top: 16px;
}

.waitlist-query-error {
  margin-bottom: 16px;
}
</style>

<script setup>
import { reactive, ref, watch } from 'vue'
import { cancelBooking, createBooking, listBookings } from '@/api/bookings'
import { useAppStore } from '@/stores/app'
import { newIdempotencyKey } from '@/utils/idempotency'

const app = useAppStore()
const rangeStorageKey = 'booking.query'
const columns = [
  { title: '预约编号', dataIndex: 'id' },
  { title: '环境', dataIndex: 'env' },
  { title: '开始（UTC）', dataIndex: 'start' },
  { title: '结束（UTC）', dataIndex: 'end' },
  { title: '预约人', dataIndex: 'user' },
  { title: '操作', key: 'action' },
]

function toUtc(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) return null

  const seconds = value.length === 16 ? `${value}:00` : value
  const time = new Date(`${seconds}Z`)
  return Number.isNaN(time.getTime()) || time.toISOString() !== `${seconds}.000Z`
    ? null
    : `${seconds}Z`
}

function utcRange({ start, end }) {
  const from = toUtc(start)
  const to = toUtc(end)
  return from && to && from < to ? { start: from, end: to } : null
}

function initialRange() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(rangeStorageKey))
    if (saved && utcRange(saved)) return saved
  } catch {
    // An unreadable saved range can be replaced by today's range.
  }
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  return { start: today.toISOString().slice(0, 19), end: tomorrow.toISOString().slice(0, 19) }
}

const filters = reactive(initialRange())
const activeRange = ref(utcRange(filters))
const filterError = ref('')
const listError = ref('')
const actionError = ref('')
const notice = ref('')
const rows = ref([])
const loading = ref(false)
const dialogOpen = ref(false)
const draft = reactive({ start: '', end: '' })
const draftError = ref('')
const submitting = ref(false)
const cancellingId = ref(null)
const submissionKeys = new Map()
const rangeError = '请填写有效的 UTC 起止时间，结束时间须晚于开始时间。'
let queryVersion = 0
let contextVersion = 0

async function reload() {
  const version = ++queryVersion
  loading.value = true
  listError.value = ''
  try {
    const res = await listBookings({ env: app.env, ...activeRange.value })
    if (version === queryVersion) rows.value = res.data
  } catch (err) {
    if (version === queryVersion) {
      rows.value = []
      listError.value = err.message
    }
  } finally {
    if (version === queryVersion) loading.value = false
  }
}

watch([() => app.env, () => app.user], () => {
  contextVersion++
  rows.value = []
  notice.value = ''
  actionError.value = ''
  dialogOpen.value = false
  reload()
}, { immediate: true, flush: 'sync' })

function applyRange(range) {
  activeRange.value = range
  sessionStorage.setItem(rangeStorageKey, JSON.stringify(filters))
}

function search() {
  const range = utcRange(filters)
  filterError.value = range ? '' : rangeError
  if (!range) return

  rows.value = []
  applyRange(range)
  reload()
}

function openCreate() {
  draft.start = activeRange.value.start.slice(0, -1)
  draft.end = activeRange.value.end.slice(0, -1)
  draftError.value = ''
  submissionKeys.clear()
  dialogOpen.value = true
}

async function submitBooking() {
  if (submitting.value) return

  const range = utcRange(draft)
  draftError.value = range ? '' : rangeError
  if (!range) return

  const payload = { env: app.env, ...range }
  const signature = JSON.stringify(payload)
  if (!submissionKeys.has(signature)) submissionKeys.set(signature, newIdempotencyKey())

  const version = contextVersion
  submitting.value = true
  try {
    const res = await createBooking(payload, submissionKeys.get(signature))
    if (version !== contextVersion) return

    dialogOpen.value = false
    actionError.value = ''
    notice.value = `预约成功 · 编号 ${res.data.id}`
    if (range.start >= activeRange.value.end || range.end <= activeRange.value.start) {
      Object.assign(filters, draft)
      filterError.value = ''
      applyRange(range)
    }
    await reload()
  } catch (err) {
    if (version === contextVersion) draftError.value = err.message
  } finally {
    submitting.value = false
  }
}

async function removeBooking(record) {
  if (cancellingId.value !== null || record.user !== app.user || record.env !== app.env) return

  const version = contextVersion
  cancellingId.value = record.id
  actionError.value = ''
  notice.value = ''
  try {
    await cancelBooking(record.id)
    if (version !== contextVersion) return

    notice.value = `预约已取消 · 编号 ${record.id}`
    await reload()
  } catch (err) {
    if (version === contextVersion) actionError.value = err.message
  } finally {
    cancellingId.value = null
  }
}
</script>

<template>
  <section class="bookings">
    <div class="page-heading">
      <h1>预约与取消</h1>
      <a-button type="primary" :disabled="submitting" @click="openCreate">新建预约</a-button>
    </div>

    <a-card>
      <a-form :model="filters" layout="vertical" class="time-fields" @finish="search">
        <a-form-item label="开始时间（UTC）" html-for="booking-query-start" name="start">
          <a-input id="booking-query-start" v-model:value="filters.start" type="datetime-local" step="1" />
        </a-form-item>
        <a-form-item label="结束时间（UTC）" html-for="booking-query-end" name="end">
          <a-input id="booking-query-end" v-model:value="filters.end" type="datetime-local" step="1" />
        </a-form-item>
        <a-button html-type="submit" :loading="loading">查询</a-button>
      </a-form>
      <a-alert v-if="filterError" class="feedback" type="warning" :message="filterError" show-icon />
      <a-alert v-if="notice" class="feedback" type="success" :message="notice" show-icon />
      <a-alert v-if="actionError" class="feedback" type="error" :message="actionError" show-icon />
      <a-alert v-if="listError" class="feedback" type="error" :message="listError" show-icon />
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="false"
        :scroll="{ x: 740 }"
        :locale="{ emptyText: listError ? '预约列表加载失败' : '该时段暂无预约' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action' && record.user === app.user">
            <a-popconfirm
              :title="`取消预约 ${record.id}？`"
              ok-text="确认取消"
              cancel-text="保留预约"
              @confirm="removeBooking(record)"
            >
              <a-button
                type="link"
                danger
                :disabled="cancellingId !== null"
                :loading="cancellingId === record.id"
              >取消预约</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      :open="dialogOpen"
      title="新建预约"
      ok-text="提交预约"
      cancel-text="返回"
      :confirm-loading="submitting"
      :closable="!submitting"
      :keyboard="!submitting"
      :mask-closable="!submitting"
      :cancel-button-props="{ disabled: submitting }"
      @ok="submitBooking"
      @cancel="dialogOpen = false"
    >
      <p>{{ app.env }} · {{ app.user }}</p>
      <a-form :model="draft" layout="vertical" class="time-fields" @finish="submitBooking">
        <a-form-item label="预约开始时间（UTC）" html-for="booking-start" name="start">
          <a-input id="booking-start" v-model:value="draft.start" type="datetime-local" step="1" :disabled="submitting" />
        </a-form-item>
        <a-form-item label="预约结束时间（UTC）" html-for="booking-end" name="end">
          <a-input id="booking-end" v-model:value="draft.end" type="datetime-local" step="1" :disabled="submitting" />
        </a-form-item>
      </a-form>
      <a-alert v-if="draftError" type="error" :message="draftError" show-icon />
    </a-modal>
  </section>
</template>

<style scoped>
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.page-heading h1 {
  margin: 0;
  font-size: 27px;
  letter-spacing: -0.02em;
}
.time-fields {
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 12px 16px;
  margin-bottom: 20px;
}
.time-fields :deep(.ant-form-item) { margin-bottom: 0; }
.feedback { margin-bottom: 12px; }
</style>

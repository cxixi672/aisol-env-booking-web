<script>
import { createWaitlist, listWaitlist } from '@/api/waitlist'
import RangeFields from '@/components/windows/RangeFields.vue'
import useTable from '@/mixins/useTable'
import { createIdempotentSubmission } from '@/utils/idempotency'
import { currentUtcDay, parseRange } from '@/utils/range'
import { columns, fields, statuses, storagePrefix } from './config'

const submitWaitlist = createIdempotentSubmission(createWaitlist)

export default {
  name: 'WaitlistPage',
  components: { RangeFields },
  mixins: [useTable],
  data() {
    const today = currentUtcDay()
    return {
      columns,
      fields,
      statuses,
      draft: {
        start: sessionStorage.getItem(`${storagePrefix}.start`) ?? today.start,
        end: sessionStorage.getItem(`${storagePrefix}.end`) ?? today.end,
      },
      submitting: false,
      formError: '',
      success: '',
    }
  },
  mounted() {
    this.refresh()
  },
  methods: {
    onContextChange() {
      this.success = ''
      this.refresh()
    },
    readRange() {
      const { range, error } = parseRange(this.draft)
      this.formError = error ?? ''
      return range
    },
    loadWaitlist(range) {
      sessionStorage.setItem(`${storagePrefix}.start`, range.start)
      sessionStorage.setItem(`${storagePrefix}.end`, range.end)
      return this.getTableData(listWaitlist, range)
    },
    refresh() {
      const range = this.readRange()
      if (range) return this.loadWaitlist(range)
    },
    async submit() {
      if (this.submitting) return
      this.success = ''
      const range = this.readRange()
      if (!range) return
      const version = this.contextVersion
      const { user, env } = this.appStore
      this.submitting = true
      try {
        await submitWaitlist(user, { env, ...range })
        if (version !== this.contextVersion) return
        this.success = '已加入候补队列。'
        await this.loadWaitlist(range)
      } catch (error) {
        if (version === this.contextVersion) this.formError = error.message
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<template>
  <section class="waitlist-page">
    <div class="page-heading"><h1>候补与递补</h1></div>
    <a-card>
      <a-form :model="draft" layout="vertical" @finish="submit">
        <div class="waitlist-range">
          <RangeFields v-model:start="draft.start" v-model:end="draft.end" :fields="fields" :disabled="submitting" />
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
      <a-alert v-if="listError" class="page-feedback" type="error" :message="listError" show-icon />
      <p v-if="listedRange">查询区间 {{ listedRange.start }} 至 {{ listedRange.end }}</p>
      <a-table
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="false"
        :scroll="{ x: 640 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <a-tag v-if="column.dataIndex === 'status'" :color="(statuses[record.status] ?? statuses.waiting).color">
            {{ (statuses[record.status] ?? statuses.waiting).label }}
          </a-tag>
          <template v-else-if="column.dataIndex === 'bookingId'">{{ record.bookingId || '—' }}</template>
        </template>
      </a-table>
    </a-card>
  </section>
</template>

<style lang="scss" scoped>
.waitlist-page { display: grid; gap: 16px; }
.page-heading { margin-bottom: 0; }
.waitlist-range {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 12px 16px;
  max-width: 640px;
}
.waitlist-alert { margin-top: 16px; }
</style>

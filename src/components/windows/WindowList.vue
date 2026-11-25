<script>
import EditModal from './EditModal.vue'
import TableSearch from './TableSearch.vue'
import useTable from '@/mixins/useTable'
import { inputRange, parseRange, savedRange } from '@/utils/range'

export default {
  name: 'WindowList',
  components: { EditModal, TableSearch },
  mixins: [useTable],
  props: { config: { type: Object, required: true } },
  data() {
    const activeRange = savedRange(this.config.storageKey, this.config.localInput)
    return {
      activeRange,
      searchInfo: inputRange(activeRange, this.config.localInput),
      filterError: '',
      notice: '',
      actionError: '',
      createError: '',
      submitting: false,
      cancellingId: null,
    }
  },
  computed: {
    canCreate() {
      return this.config.canCreate(this.appStore.user)
    },
    columns() {
      return this.canCreate ? this.config.columns : this.config.columns.filter(column => column.key !== 'action')
    },
  },
  mounted() {
    this.reload()
  },
  methods: {
    onContextChange() {
      this.notice = ''
      this.actionError = ''
      this.createError = ''
      this.$refs.editor?.close()
      this.reload()
    },
    reload() {
      return this.getTableData(this.config.list, this.activeRange)
    },
    applyRange(range) {
      this.activeRange = range
      this.searchInfo = inputRange(range, this.config.localInput)
      sessionStorage.setItem(this.config.storageKey, JSON.stringify(this.searchInfo))
    },
    search() {
      const { range, error } = parseRange(this.searchInfo, this.config.localInput)
      this.filterError = error ?? ''
      if (!range) return
      this.applyRange(range)
      return this.reload()
    },
    openCreate() {
      this.createError = ''
      this.$refs.editor.open(this.activeRange)
    },
    async createRecord(range) {
      if (!this.canCreate || this.submitting) return
      const version = this.contextVersion
      const { env, user } = this.appStore
      this.submitting = true
      try {
        const response = await this.config.create(user, { env, ...range })
        if (version !== this.contextVersion) return
        this.$refs.editor.close()
        this.actionError = ''
        this.notice = this.config.createdText(response.data.id)
        if (range.start >= this.activeRange.end || range.end <= this.activeRange.start) {
          this.filterError = ''
          this.applyRange(range)
        }
        await this.reload()
      } catch (error) {
        if (version === this.contextVersion) this.createError = error.message
      } finally {
        this.submitting = false
      }
    },
    canCancel(record) {
      return this.config.canCancel(this.appStore, record)
    },
    async cancelRecord(record) {
      if (!this.canCancel(record) || this.cancellingId !== null) return
      const version = this.contextVersion
      this.cancellingId = record.id
      this.notice = ''
      this.actionError = ''
      try {
        await this.config.cancel(record.id, this.appStore.user)
        if (version !== this.contextVersion) return
        this.notice = this.config.cancelledText(record.id)
        await this.reload()
      } catch (error) {
        if (version === this.contextVersion) this.actionError = error.message
      } finally {
        this.cancellingId = null
      }
    },
  },
}
</script>

<template>
  <section>
    <div class="page-heading">
      <h1>{{ config.title }}</h1>
      <a-button v-if="canCreate" type="primary" :disabled="submitting" @click="openCreate">
        {{ config.addText }}
      </a-button>
    </div>
    <a-card>
      <TableSearch
        v-model:search-info="searchInfo"
        :fields="config.searchFields"
        :local-input="config.localInput"
        :loading="loading"
        @search="search"
      />
      <a-alert v-if="filterError" class="page-feedback" type="warning" :message="filterError" show-icon />
      <a-alert v-if="notice" class="page-feedback" type="success" :message="notice" show-icon />
      <a-alert v-if="actionError" class="page-feedback" type="error" :message="actionError" show-icon />
      <a-alert v-if="listError" class="page-feedback" type="error" :message="listError" show-icon />
      <a-table
        :key="contextVersion"
        row-key="id"
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="false"
        :scroll="{ x: config.tableWidth }"
        :locale="{ emptyText: listError ? config.loadFailedText : config.emptyText }"
      >
        <template #bodyCell="{ column, record }">
          <a-popconfirm
            v-if="column.key === 'action' && canCancel(record)"
            :title="config.cancelTitle(record)"
            :ok-text="config.confirmCancelText"
            :cancel-text="config.keepText"
            :ok-button-props="{ danger: true }"
            @confirm="cancelRecord(record)"
          >
            <a-button
              type="link"
              danger
              :disabled="cancellingId !== null"
              :loading="cancellingId === record.id"
            >{{ config.cancelText }}</a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>
    <EditModal
      ref="editor"
      :config="config"
      :env="appStore.env"
      :user="appStore.user"
      :submitting="submitting"
      :request-error="createError"
      @submit="createRecord"
      @clear-error="createError = ''"
    />
  </section>
</template>

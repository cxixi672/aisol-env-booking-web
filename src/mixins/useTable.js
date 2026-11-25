import { mapStores } from 'pinia'
import { useAppStore } from '@/stores/app'

export default {
  data: () => ({
    rows: [],
    loading: false,
    listError: '',
    listedRange: null,
    listController: null,
    contextVersion: 0,
  }),
  computed: {
    ...mapStores(useAppStore),
    contextKey() {
      return JSON.stringify([this.appStore.env, this.appStore.user])
    },
  },
  watch: {
    contextKey: {
      flush: 'sync',
      handler() {
        this.contextVersion++
        this.clearTable()
        this.onContextChange()
      },
    },
  },
  beforeUnmount() {
    this.contextVersion++
    this.listController?.abort()
  },
  methods: {
    clearTable() {
      this.listController?.abort()
      this.rows = []
      this.listedRange = null
      this.listError = ''
      this.loading = false
    },
    async getTableData(listApi, range) {
      this.clearTable()
      const controller = new AbortController()
      this.listController = controller
      this.loading = true
      const { env, user } = this.appStore
      try {
        const response = await listApi({ env, ...range }, user, controller.signal)
        if (controller.signal.aborted) return
        this.rows = response.data ?? []
        this.listedRange = range
      } catch (error) {
        if (!controller.signal.aborted) this.listError = error.message
      } finally {
        if (!controller.signal.aborted) this.loading = false
      }
    },
  },
}

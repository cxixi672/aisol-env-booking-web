<script>
import RangeFields from './RangeFields.vue'
import { inputRange, parseRange } from '@/utils/range'

export default {
  name: 'EditModal',
  components: { RangeFields },
  props: {
    config: { type: Object, required: true },
    submitting: Boolean,
    requestError: { type: String, default: '' },
    env: { type: String, required: true },
    user: { type: String, required: true },
  },
  emits: ['submit', 'clear-error'],
  data: () => ({ visible: false, draft: { start: '', end: '' }, validationError: '' }),
  methods: {
    open(range) {
      this.draft = inputRange(range, this.config.localInput)
      this.validationError = ''
      this.visible = true
    },
    close() {
      this.visible = false
    },
    submit() {
      if (this.submitting) return
      const { range, error } = parseRange(this.draft, this.config.localInput)
      this.validationError = error ?? ''
      this.$emit('clear-error')
      if (range) this.$emit('submit', range)
    },
  },
}
</script>

<template>
  <a-modal
    :open="visible"
    :title="config.editTitle(env)"
    :ok-text="config.submitText"
    cancel-text="返回"
    :confirm-loading="submitting"
    :cancel-button-props="{ disabled: submitting }"
    :closable="!submitting"
    :keyboard="!submitting"
    :mask-closable="config.localInput && !submitting"
    @ok="submit"
    @cancel="close"
  >
    <p v-if="config.localInput">{{ env }} · {{ user }}</p>
    <a-form :model="draft" layout="vertical" @finish="submit">
      <RangeFields
        v-model:start="draft.start"
        v-model:end="draft.end"
        :fields="config.editFields"
        :local-input="config.localInput"
        :disabled="submitting"
      />
    </a-form>
    <a-alert v-if="validationError || requestError" :message="validationError || requestError" type="error" show-icon />
  </a-modal>
</template>

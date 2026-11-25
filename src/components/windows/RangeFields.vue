<script>
export default {
  name: 'RangeFields',
  props: {
    start: { type: String, required: true },
    end: { type: String, required: true },
    fields: { type: Object, required: true },
    localInput: Boolean,
    disabled: Boolean,
  },
  emits: ['update:start', 'update:end'],
}
</script>

<template>
  <a-form-item :label="fields.startLabel" :html-for="fields.startId" name="start">
    <a-input
      :id="fields.startId"
      :value="start"
      :type="localInput ? 'datetime-local' : 'text'"
      :step="localInput ? 1 : undefined"
      :placeholder="fields.startPlaceholder"
      :disabled="disabled"
      @update:value="$emit('update:start', $event)"
    />
  </a-form-item>
  <a-form-item :label="fields.endLabel" :html-for="fields.endId" name="end">
    <a-input
      :id="fields.endId"
      :value="end"
      :type="localInput ? 'datetime-local' : 'text'"
      :step="localInput ? 1 : undefined"
      :placeholder="fields.endPlaceholder"
      :disabled="disabled"
      @update:value="$emit('update:end', $event)"
    />
  </a-form-item>
</template>

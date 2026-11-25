<script>
import RangeFields from './RangeFields.vue'

export default {
  name: 'TableSearch',
  components: { RangeFields },
  props: {
    searchInfo: { type: Object, required: true },
    fields: { type: Object, required: true },
    localInput: Boolean,
    loading: Boolean,
  },
  emits: ['update:searchInfo', 'search'],
}
</script>

<template>
  <a-form :model="searchInfo" layout="inline" class="table-search" @finish="$emit('search')">
    <RangeFields
      :fields="fields"
      :local-input="localInput"
      :start="searchInfo.start"
      :end="searchInfo.end"
      @update:start="$emit('update:searchInfo', { ...searchInfo, start: $event })"
      @update:end="$emit('update:searchInfo', { ...searchInfo, end: $event })"
    />
    <a-form-item><a-button html-type="submit" :loading="loading">查询</a-button></a-form-item>
  </a-form>
</template>

<style lang="scss" scoped>
.table-search { row-gap: 12px; margin-bottom: 16px; }
</style>

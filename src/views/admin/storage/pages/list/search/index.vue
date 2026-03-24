<template>
  <div class="file-search">
    <a-button type="primary">
      <icon-search />
      <span class="ml-5">搜索</span>
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { useFileListStore } from '../../../stores/file-list'

const route = useRoute()
const fileStore = useFileListStore()
const { keyword } = storeToRefs(fileStore)
</script>

<style lang="scss">
.search-input {
  .arco-input-wrapper {
    background-color: var(--card-bg);
  }
}
</style>

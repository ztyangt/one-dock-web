<template>
  <a-button class="card-bg" @click="handleSearch">
    <icon-refresh />
    <span class="ml-5">刷新</span>
  </a-button>
</template>

<script setup lang="ts">
import { useFileListStore } from '../../../stores/file-list'

const route = useRoute()

const store = useFileListStore()
const { getFileList } = store
const { order } = storeToRefs(store)

const handleSearch = () => {
  getFileList(route.query.folder as string)
}
</script>

<style lang="scss" scoped></style>

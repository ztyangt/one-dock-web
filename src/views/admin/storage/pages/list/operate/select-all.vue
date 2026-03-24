<template>
  <a-button class="card-bg" @click="checkedList = fileList.map((item) => item.id)">
    <c-icon name="checkbox-circle-line" /> <span class="ml-5">全选</span>
  </a-button>
</template>

<script setup lang="ts">
import { useFileListStore } from '../../../stores/file-list'

const store = useFileListStore()
const { checkedList, fileList } = storeToRefs(store)
</script>

<style lang="scss" scoped></style>

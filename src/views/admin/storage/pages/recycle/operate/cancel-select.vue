<template>
  <a-button class="card-bg" @click="checkedList = []">
    <c-icon name="refresh-line" /> <span class="ml-5">取消</span>
  </a-button>
</template>

<script setup lang="ts">
import { useRecycleStore } from '../../../stores/file-recycle'

const store = useRecycleStore()
const { checkedList } = storeToRefs(store)
</script>

<style lang="scss" scoped></style>

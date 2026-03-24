<template>
  <a-button class="card-bg" @click="checkedList = []"> <c-icon name="refresh-line" /> <span class="ml-5">取消</span> </a-button>
</template>

<script setup lang="ts">
import { useFileListStore } from "../../../stores/file-list";

const store = useFileListStore();
const { checkedList } = storeToRefs(store);
</script>

<style lang="scss" scoped></style>

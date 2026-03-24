<template>
  <a-badge :max-count="99" :count="pendingCount">
    <a-button type="primary" @click="router.push({ name: 'files-transfer' })">
      <c-icon name="arrow-up-down-line" />
      <span class="ml-5">传输任务</span>
    </a-button>
  </a-badge>
</template>

<script setup lang="ts">
import { useFileUploadStore } from "../../../stores/file-upload";

const router = useRouter();

const { pendingCount } = storeToRefs(useFileUploadStore());
</script>

<style lang="scss" scoped></style>

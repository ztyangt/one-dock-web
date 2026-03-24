<template>
  <div class="file-transfer-upload-status-wrap flex-sb flex-yc g-15 flex-wrap">
    <div class="flex-yc g-5">
      <a-tag class="card-bg">上传列表</a-tag>
      <!-- <a-tag class="card-bg">已上传 26%</a-tag> -->
    </div>

    <div class="flex-yc g-10">
      <ResponsiveBtn
        :disabled="!(pauseCount > 0 || failedCount > 0)"
        @click="handleStart"
        class="card-bg"
        :text="hasSelected ? '开始' : '全部开始'"
        size="small"
      >
        <template #icon><icon-play-arrow-fill /></template>
      </ResponsiveBtn>

      <ResponsiveBtn
        :disabled="!(awaitingCount > 0 || uploadingCount > 0)"
        @click="handlePause"
        class="card-bg"
        :text="hasSelected ? '暂停' : '全部暂停'"
        size="small"
      >
        <template #icon><icon-pause /></template>
      </ResponsiveBtn>

      <ResponsiveBtn
        :disabled="!(awaitingCount > 0 || pauseCount > 0 || failedCount > 0)"
        @click="handleCancel"
        class="card-bg"
        :text="hasSelected ? '取消' : '全部取消'"
        size="small"
      >
        <template #icon><icon-close /></template>
      </ResponsiveBtn>
    </div>
  </div>
</template>

<script setup lang="ts">
import ResponsiveBtn from "@/components/base/responsive-btn.vue";
import { useFileUploadStore } from "../../../stores/file-upload";

const uploadStore = useFileUploadStore();
const { startAll, pauseAll, cancelAll, startSelected, pauseSelected, cancelSelected } = uploadStore;
const { hasSelected, awaitingCount, uploadingCount, pauseCount, failedCount } = storeToRefs(uploadStore);

const handleStart = () => {
  if (hasSelected.value) {
    startSelected();
  } else {
    startAll();
  }
};

const handlePause = () => {
  if (hasSelected.value) {
    pauseSelected();
  } else {
    pauseAll();
  }
};

const handleCancel = () => {
  if (hasSelected.value) {
    cancelSelected();
  } else {
    cancelAll();
  }
};
</script>

<style lang="scss">
.file-transfer-upload-status-wrap {
  .arco-checkbox-icon {
    height: 18px;
    width: 18px;
  }
}
</style>

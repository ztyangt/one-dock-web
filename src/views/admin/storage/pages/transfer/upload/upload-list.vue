<template>
  <div class="file-transfer-upload-list flex-column">
    <a-table
      ref="uploadTableRef"
      :data="uploadingList"
      :pagination="false"
      :bordered="false"
      :stripe="false"
      :scroll="{ maxHeight: '100%', x: 500 }"
      class="flex-table br-8 0verhide"
      :row-selection="{ type: 'checkbox', showCheckedAll: true }"
      @selection-change="handleSelectionChange"
      row-key="uuid"
    >
      <template #columns>
        <a-table-column title="名称" :min-width="200">
          <template #cell="{ record }">
            <div class="flex-yc">
              <img :src="getFileIcon(record.extension)" class="file-icon mr-5" />
              <span :title="record.file.name" class="h-1x">{{ record.file.name }}</span>
            </div>
          </template>
        </a-table-column>

        <a-table-column title="状态" :min-width="200">
          <template #cell="{ record }">
            <div class="flex-yc">
              <span class="fs-12 flex-yc flex-shrink-0" style="width: 55px">
                <span>{{ statusMap[record.status] }}</span>
                <a-spin
                  v-if="record.status === FileUploadStatus.PREPARING"
                  class="ml-5"
                  :size="12"
                />
              </span>
              <a-progress
                :style="{ width: '180px' }"
                :status="progressStatus(record.status)"
                :size="'medium'"
                animation
                :percent="Number(record.progress.toFixed(2))"
              />
            </div>
          </template>
        </a-table-column>

        <a-table-column title="大小" :width="150">
          <template #cell="{ record }">
            <span>{{ formatFileSize(record.file.size) }}</span>
          </template>
        </a-table-column>
        <!-- <a-table-column title="哈希" :width="300">
          <template #cell="{ record }">
            <span>{{ record.hash }}</span>
          </template>
        </a-table-column> -->

        <a-table-column title="操作" fixed="right" :width="100">
          <template #cell="{ record }">
            <div class="flex-yc">
              <a-tooltip
                v-if="
                  record.status === FileUploadStatus.PAUSE ||
                  record.status === FileUploadStatus.PREPARING
                "
                content="开始"
                mini
                :disabled="isDisabled(record.status, 'start')"
              >
                <a-button
                  @click="handleStartUpload(record)"
                  size="mini"
                  :disabled="isDisabled(record.status, 'start')"
                >
                  <template #icon><icon-play-arrow-fill :size="16" /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip
                v-if="
                  record.status === FileUploadStatus.UPLOADING ||
                  record.status === FileUploadStatus.AWAITING
                "
                content="暂停"
                mini
                :disabled="isDisabled(record.status, 'pause')"
              >
                <a-button
                  @click="record.status = FileUploadStatus.PAUSE"
                  size="mini"
                  :disabled="isDisabled(record.status, 'pause')"
                >
                  <template #icon><icon-pause :size="16" /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip
                v-if="record.status === FileUploadStatus.FAILED"
                content="重试"
                mini
                :disabled="isDisabled(record.status, 'retry')"
              >
                <a-button
                  @click="record.status = FileUploadStatus.AWAITING"
                  size="mini"
                  :disabled="isDisabled(record.status, 'retry')"
                >
                  <template #icon><icon-refresh :size="16" /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                @ok="removeFile(record.uuid)"
                type="warning"
                content="确认取消上传任务吗?"
              >
                <a-button size="mini" class="ml-15" :disabled="isDisabled(record.status, 'cancel')">
                  <template #icon><icon-close :size="16" /></template>
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { getFileIcon, formatFileSize } from '../../../utils/'
import { FileUploadStatus } from '@/data/enum/file'
import { useFileUploadStore } from '../../../stores/file-upload'

const uploadStore = useFileUploadStore()
const { removeFile, handleStartUpload } = uploadStore
const { uploadingList, selectedKeys } = storeToRefs(uploadStore)

const handleSelectionChange = (selectedRowKeys: string[]) => {
  selectedKeys.value = selectedRowKeys
}

const statusMap: Record<string, any> = {
  [FileUploadStatus.PREPARING]: '准备中',
  [FileUploadStatus.AWAITING]: '等待中',
  [FileUploadStatus.UPLOADING]: '上传中',
  [FileUploadStatus.PAUSE]: '已暂停',
  [FileUploadStatus.FAILED]: '上传失败'
}

const isDisabled = (status: FileUploadStatus, btn: 'start' | 'pause' | 'cancel' | 'retry') => {
  switch (status) {
    case FileUploadStatus.PREPARING:
      return true
    case FileUploadStatus.AWAITING:
      return btn !== 'cancel' && btn !== 'pause'
    case FileUploadStatus.UPLOADING:
      return btn !== 'pause'
    case FileUploadStatus.PAUSE:
      return btn !== 'start' && btn !== 'cancel'
    case FileUploadStatus.FAILED:
      return btn !== 'retry' && btn !== 'cancel'
    default:
      return false
  }
}

const progressStatus = (status: FileUploadStatus) => {
  switch (status) {
    case FileUploadStatus.PREPARING:
      return 'normal'
    case FileUploadStatus.AWAITING:
      return 'normal'
    case FileUploadStatus.PAUSE:
      return 'normal'
    case FileUploadStatus.UPLOADING:
      return 'success'
    case FileUploadStatus.FAILED:
      return 'danger'
    default:
      return 'normal'
  }
}
</script>

<style lang="scss">
.file-transfer-upload-list {
  .file-icon {
    height: 28px;
  }

  .arco-scrollbar {
    height: auto;
  }

  .arco-progress-line-text svg {
    display: none;
  }

  .arco-progress-status-normal {
    .arco-progress-line-bar {
      background-color: var(--main-bg);
    }
  }
}
</style>

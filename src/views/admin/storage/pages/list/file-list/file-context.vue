<template>
  <a-dgroup>
    <a-doption @click="moveDialogVisible = true">
      <template #icon> <c-icon name="drag-move-line" /> </template>
      <span>移动</span>
    </a-doption>
    <a-doption @click="renameFileDialogVisible = true" :disabled="checkedList.length > 1">
      <template #icon>
        <c-icon name="edit-box-line" />
      </template>
      <span>重命名</span>
    </a-doption>
    <a-doption
      v-if="currentEditFile?.file_type === FileEnumType.FILE"
      @click="handleCopyLink"
      :disabled="checkedList.length > 0"
    >
      <template #icon> <c-icon name="link-m" /> </template>
      <span>复制直链</span>
    </a-doption>
    <a-doption
      v-if="currentEditFile?.file_type === FileEnumType.FILE"
      @click="handleDownloadFile"
      :disabled="checkedList.length > 0"
    >
      <template #icon><c-icon name="download-2-line" /> </template>
      <span>下载文件</span>
    </a-doption>
    <a-doption @click="fileDetailDialogVisible = true" :disabled="checkedList.length > 0">
      <template #icon> <c-icon name="information-line" /> </template>
      <span>查看详情</span>
    </a-doption>

    <a-doption @click="handleDelete" class="danger-btn">
      <template #icon> <c-icon name="delete-bin-4-line" /> </template>
      <!-- <span v-if="currentEditFile?.file_type === FileEnumType.FOLDER">删除文件夹</span>
      <span v-else>删除文件</span> -->
      <span>移至回收站</span>
    </a-doption>
  </a-dgroup>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import { FileEnumType } from '@/data/enum/file'
import { copyToClipboard } from '@wiit/vue3-helper'
import { useFileListStore } from '../../../stores/file-list'

const store = useFileListStore()
const {
  renameFileDialogVisible,
  fileDetailDialogVisible,
  moveDialogVisible,
  currentEditFile,
  checkedList
} = storeToRefs(useFileListStore())

const handleDelete = () => {
  // const title = currentEditFile.value?.file_type === FileEnumType.FOLDER ? '删除文件夹' : '删除文件'
  const title = '移至回收站'
  Modal.error({
    simple: true,
    hideCancel: false,
    alignCenter: true,
    titleAlign: 'start',
    title,
    // content: '删除后无法恢复，确认删除所选文件吗？',
    content: '移至回收站可恢复，但仍然占用磁盘空间，是否继续？',

    onOk: async () => {
      // if (!currentEditFile.value?.id) return
      store.moveToRecycleBin(
        checkedList.value.length > 0
          ? checkedList.value
          : currentEditFile.value?.id
            ? [currentEditFile.value.id]
            : []
      )
    }
  })
}

const { getUrl } = useSystemStore()
const handleCopyLink = (event: MouseEvent) => {
  if (!currentEditFile.value) return
  copyToClipboard(getUrl(`/file/${currentEditFile.value.id}`)).then(() =>
    Message.success('直链复制成功！')
  )
}

const handleDownloadFile = () => {
  if (!currentEditFile.value) return
  const url = getUrl(`/file/${currentEditFile.value.id}?uinx=${Date.now()}`)
  const a = document.createElement('a')
  a.href = url
  a.download = currentEditFile.value.name + '.' + currentEditFile.value.extension
  a.target = url
  a.target = '_blank'
  a.click()
}
</script>

<style lang="scss" scoped>
.danger-btn {
  color: var(--danger-color);
  &:hover {
    color: var(--danger-color);
    background-color: #ff00001a;
  }
}
</style>

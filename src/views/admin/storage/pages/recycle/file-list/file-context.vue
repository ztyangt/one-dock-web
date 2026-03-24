<template>
  <a-dgroup>
    <a-doption @click="handleRestore" :disabled="currentEditFile?.parent_id !== '0'">
      <template #icon> <c-icon name="refresh-line" /> </template>
      <span>放回原处</span>
    </a-doption>
    <a-doption @click="fileDetailDialogVisible = true" :disabled="checkedList.length > 0">
      <template #icon> <c-icon name="information-line" /> </template>
      <span>查看详情</span>
    </a-doption>
    <!-- <a-doption @click="moveDialogVisible = true">
      <template #icon> <c-icon name="drag-move-line" /> </template>
      <span>恢复</span>
    </a-doption> -->

    <a-doption @click="handleDelete" class="danger-btn">
      <template #icon> <c-icon name="delete-bin-4-line" /> </template>
      <span>彻底删除</span>
    </a-doption>
  </a-dgroup>
</template>

<script setup lang="ts">
import { Modal } from '@arco-design/web-vue'
import { FileEnumType } from '@/data/enum/file'
import { useRecycleStore } from '../../../stores/file-recycle'

const store = useRecycleStore()
const { restoreFile } = store
const { currentEditFile, fileDetailDialogVisible, checkedList } = storeToRefs(useRecycleStore())

// 放回原处
const handleRestore = () => {
  // if (!currentEditFile.value?.id) return
  restoreFile(
    checkedList.value.length > 0
      ? checkedList.value
      : currentEditFile.value?.id
        ? [currentEditFile.value.id]
        : []
  )
}

const handleDelete = () => {
  const title = currentEditFile.value?.file_type === FileEnumType.FOLDER ? '删除文件夹' : '删除文件'
  Modal.error({
    simple: true,
    hideCancel: false,
    alignCenter: true,
    titleAlign: 'start',
    title,
    content: '删除后无法恢复，确认删除所选文件吗？',

    onOk: async () => {
      // if (!currentEditFile.value?.id) return
      store.deleteFile(
        checkedList.value.length > 0
          ? checkedList.value
          : currentEditFile.value?.id
            ? [currentEditFile.value.id]
            : []
      )
    }
  })
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

<template>
  <a-button class="card-bg delete-color" @click="handleDelete">
    <c-icon name="delete-bin-5-fill" />
    <span class="ml-5">删除</span>
  </a-button>
</template>

<script setup lang="ts">
import { Modal } from '@arco-design/web-vue'
import { useFileListStore } from '../../../stores/file-list'

const store = useFileListStore()
const { moveToRecycleBin } = store
const { checkedList } = storeToRefs(store)

const handleDelete = () => {
  Modal.error({
    simple: true,
    hideCancel: false,
    alignCenter: true,
    titleAlign: 'start',
    title: '回收文件',
    content: '将所选文件批量移至回收站，确认继续吗？',

    onOk: async () => {
      await moveToRecycleBin(checkedList.value)
      checkedList.value = []
    }
  })
}
</script>

<style lang="scss" scoped></style>

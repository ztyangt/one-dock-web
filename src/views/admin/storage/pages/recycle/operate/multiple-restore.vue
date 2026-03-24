<template>
  <a-button class="card-bg success-color" @click="handleDelete">
    <c-icon name="refresh-line" />
    <span class="ml-5">恢复</span>
  </a-button>
</template>

<script setup lang="ts">
import { Modal } from '@arco-design/web-vue'
import { useRecycleStore } from '../../../stores/file-recycle'

const store = useRecycleStore()
const { restoreFile } = store
const { checkedList } = storeToRefs(store)

const handleDelete = () => {
  Modal.confirm({
    simple: true,
    hideCancel: false,
    alignCenter: true,
    titleAlign: 'start',
    title: '恢复文件',
    content: '恢复后文件将出现在原目录，确认恢复所选文件吗？',

    onOk: async () => {
      await restoreFile(checkedList.value)
      checkedList.value = []
    }
  })
}
</script>

<style lang="scss" scoped></style>

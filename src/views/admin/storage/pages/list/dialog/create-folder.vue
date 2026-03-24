<template>
  <a-modal
    class="create-folder-dialog"
    :visible="createFolderDialogVisible"
    @ok="handleOk"
    @cancel="createFolderDialogVisible = false"
    :width="350"
    title-align="start"
    :ok-loading="loading"
    :onClose="handleClose"
  >
    <template #title> 新建文件夹 </template>
    <div class="flex-center">
      <img class="folder-icon no-select" :src="getFileIcon('folder')" />
    </div>

    <a-input
      ref="folderNameRef"
      @focus="error = false"
      :error="error"
      allow-clear
      class="mt-50"
      placeholder="请输入文件夹名称"
      @keyup.enter="handleOk"
      v-model="folderName"
    />
    <div v-show="error" class="fs-12 error-color">文件夹名称不能为空！</div>
  </a-modal>
</template>

<script setup lang="ts">
import { getFileIcon } from '../../../utils'
import { useFileListStore } from '../../../stores/file-list'

const store = useFileListStore()
const { createFolderDialogVisible } = storeToRefs(store)
const folderName = ref()
const error = ref(false)
const loading = ref(false)
const folderNameRef = useTemplateRef('folderNameRef')

watch(folderName, (val) => {
  error.value = !val?.trim()
})

watch(createFolderDialogVisible, async (val) => {
  if (val) {
    error.value = false
    await nextTick()
    folderNameRef.value.focus()
  }
})

const handleOk = async () => {
  if (!folderName.value?.trim()) {
    error.value = true
    return
  }

  loading.value = true
  await store.createFolder(folderName.value)
  loading.value = false
}

const handleClose = () => {
  folderName.value = undefined
  error.value = false
}
</script>

<style lang="scss">
.create-folder-dialog {
  .folder-icon {
    width: 100px;
  }

  .error-color {
    color: #ee564b !important;
  }
}
</style>

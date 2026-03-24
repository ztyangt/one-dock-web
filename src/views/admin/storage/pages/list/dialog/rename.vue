<template>
  <a-modal
    class="file-rename-dialog"
    :visible="renameFileDialogVisible"
    @ok="handleOk"
    @cancel="renameFileDialogVisible = false"
    :width="350"
    title-align="start"
    :ok-loading="loading"
    :onClose="handleClose"
  >
    <template #title> 重命名 </template>
    <div class="flex-center">
      <img
        class="folder-icon no-select"
        :src="
          getFileIcon(
            currentEditFile?.file_type === FileEnumType.FOLDER
              ? 'folder'
              : currentEditFile?.extension
          )
        "
      />
    </div>

    <a-input
      ref="nameRef"
      @focus="error = false"
      :error="error"
      allow-clear
      class="mt-50"
      placeholder="请输入文件夹名称"
      @keyup.enter="handleOk"
      v-model="name"
    />
    <div v-show="error" class="fs-12 error-color">{{ errorMsg }}</div>
  </a-modal>
</template>

<script setup lang="ts">
import { getFileIcon } from '../../../utils'
import { storageApi } from '@/apis'
import { FileEnumType } from '@/data/enum/file'
import { useFileListStore } from '../../../stores/file-list'

const store = useFileListStore()
const { renameFileDialogVisible, currentEditFile, fileList, checkedList } = storeToRefs(store)
const name = ref()
const error = ref(false)
const errorMsg = ref()
const loading = ref(false)
const nameRef = useTemplateRef('nameRef')

watch(
  name,
  (val) => {
    const banList = ['/', '\\', ':', '*', '?', '<', '>', '|']
    if (banList.some((it) => val?.includes(it))) {
      errorMsg.value = '文件夹名称不能包含以下字符：/ \\ : * ? < > |'
      error.value = true
      return
    }
    if (!val?.trim()) {
      errorMsg.value = '文件夹名称不能为空'
      error.value = true
      return
    }
    error.value = false
  },
  { immediate: true }
)

watch(renameFileDialogVisible, async (val) => {
  if (val) {
    error.value = false
    name.value = currentEditFile.value?.name
    await nextTick()
    nameRef.value.focus()
  }
})

const handleOk = async () => {
  if (error.value) {
    return
  }
  loading.value = true
  const { code } = await storageApi.rename({
    name: name.value,
    id: currentEditFile.value?.id
  })
  loading.value = false
  if (code !== 200) return
  renameFileDialogVisible.value = false
  const index = fileList.value.findIndex((item) => item.id === currentEditFile.value?.id)
  if (index !== -1 && fileList.value[index]) {
    fileList.value[index].name = name.value
    fileList.value[index].updated_at = new Date().getTime()
  }
}

const handleClose = () => {
  name.value = undefined
  error.value = false
}
</script>

<style lang="scss">
.file-rename-dialog {
  .folder-icon {
    width: 100px;
  }

  .error-color {
    color: #ee564b !important;
  }
}
</style>

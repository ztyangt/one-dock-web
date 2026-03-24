<template>
  <a-modal
    class="file-detail-dialog"
    :visible="fileDetailDialogVisible"
    :width="350"
    title-align="start"
    :ok-loading="loading"
    :footer="false"
    @cancel="fileDetailDialogVisible = false"
  >
    <template #title>
      {{ fileData?.file?.file_type === FileEnumType.FOLDER ? '文件夹详情' : '文件详情' }}
    </template>
    <div class="file-detail-wrap" v-loading="loading">
      <div class="flex-center">
        <img
          class="folder-icon no-select"
          :src="
            getFileIcon(
              fileData?.file?.file_type === FileEnumType.FOLDER
                ? 'folder'
                : fileData?.file?.extension
            )
          "
        />
      </div>
      <div class="mt-20" v-if="fileData">
        <span class="fs-12 mb-5 muted-color">{{
          `文件${fileData?.file?.file_type === FileEnumType.FOLDER ? '夹' : ''}名称`
        }}</span>
        <div class="mb-5 break-all">
          {{ getFileName(fileData?.file) }}
        </div>
        <span class="fs-12 mb-5 muted-color">文件大小</span>
        <div class="mb-5">
          <span>{{ fileSize }}</span>
          <span v-if="fileData?.file?.file_type === FileEnumType.FOLDER">
            （包含{{ fileData.child_folder_count }}个文件夹，{{ fileData.child_file_count }}个文件
            ）
          </span>
        </div>
        <!-- <span class="fs-12 mb-5 muted-color">原文件路径</span>
        <div class="mb-5 break-all">
          <span>{{ filePath }}</span>
        </div> -->
        <span class="fs-12 mb-5 muted-color">创建时间</span>
        <div class="mb-5">
          <span>{{ dayjs(fileData?.file.created_at).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
        <span class="fs-12 mb-5 muted-color">修改时间</span>
        <div class="mb-5">
          <span>{{ dayjs(fileData?.file.updated_at).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
        <span class="fs-12 mb-5 muted-color">删除时间</span>
        <div class="mb-5">
          <span>{{ dayjs(fileData?.file.deleted_at).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { getFileIcon, formatFileSize } from '../../../utils'
import { storageApi } from '@/apis'
import { FileEnumType } from '@/data/enum/file'
import type { FileType } from '@/types'
import { useRecycleStore } from '../../../stores/file-recycle'

const store = useRecycleStore()
const { fileDetailDialogVisible, currentEditFile } = storeToRefs(store)
const loading = ref(false)

const fileData = ref<FileType.FileDetail>()
const getFileName = (file: FileType.FileDatum) => {
  if (file.file_type === FileEnumType.FOLDER) {
    return file.name
  }
  let result = file.name
  if (file.extension) {
    result += `.${file.extension}`
  }
  return result
}

const fileSize = computed(() => {
  if (!fileData.value) return 0
  if (fileData.value.file.file_type === FileEnumType.FOLDER)
    return formatFileSize(fileData.value.size)
  return formatFileSize(fileData.value.file.size)
})

const filePath = computed(() => {
  if (!fileData.value?.parents?.length) return ''
  fileData.value.parents.pop()
  return '/' + fileData.value.parents.map((item) => item.name).join('/')
})

const getFileDetail = async () => {
  if (!currentEditFile.value) return
  loading.value = true
  const { code, data } = await storageApi.detail({ id: currentEditFile.value.id, is_trash: true })
  loading.value = false
  if (code === 200) fileData.value = data
}

watch(fileDetailDialogVisible, (val) => {
  if (val) getFileDetail()
})
</script>

<style lang="scss">
.file-detail-dialog {
  .folder-icon {
    width: 100px;
  }
}
</style>

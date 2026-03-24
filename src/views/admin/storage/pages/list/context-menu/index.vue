<template>
  <div>
    <a-dgroup title="上传">
      <a-doption @click="handleSelect('file')">
        <template #icon>
          <c-icon name="file-upload-line" />
        </template>
        <span>上传文件</span>
      </a-doption>
      <a-doption @click="handleSelect('folder')">
        <template #icon> <c-icon name="folder-upload-line" /> </template>
        <span>上传目录</span>
      </a-doption>
    </a-dgroup>
    <a-dgroup title="更多">
      <a-doption @click="getFileList(route.query.folder as string)">
        <template #icon>
          <c-icon name="refresh-line" />
        </template>
        <span>刷新页面</span>
      </a-doption>
      <a-doption @click="createFolderDialogVisible = true">
        <template #icon>
          <c-icon name="folder-add-line" />
        </template>
        <span>创建文件夹</span>
      </a-doption>
      <!-- <a-doption>
        <template #icon>
          <c-icon name="file-add-line" />
        </template>
        <span>创建文本(txt)</span>
      </a-doption>
      <a-doption>
        <template #icon>
          <c-icon name="markdown-line" />
        </template>
        <span>创建Markdown</span>
      </a-doption> -->
    </a-dgroup>
  </div>
</template>

<script setup lang="ts">
import { useFileSelect } from '@wiit/vue3-helper'
import { useFileUploadStore } from '../../../stores/file-upload'
import { useFileListStore } from '../../../stores/file-list'
import { StrategyEnumType } from '@/data/enum/file'

const { selectFile, selectFolder } = useFileSelect()
const { addFile } = useFileUploadStore()
const { getFileList } = useFileListStore()
const { createFolderDialogVisible } = storeToRefs(useFileListStore())

const route = useRoute()

const handleSelect = async (type: 'file' | 'folder') => {
  let result: FileList | null = null
  if (type === 'file') {
    result = await selectFile()
  } else if (type === 'folder') {
    result = await selectFolder()
  }

  result && addFile(result, route.query.folder as string)
}
</script>

<style lang="scss" scoped></style>

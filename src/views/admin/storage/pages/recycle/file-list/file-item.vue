<template>
  <a-dropdown class="br-8" trigger="contextMenu" alignPoint :style="{ display: 'block' }">
    <div
      v-ripple
      class="folder-item-wrap relative z-999 flex-column br-8 p-10 pointer hover-light-bg"
      :class="{ 'file-checked': checkedList.includes(file.id) }"
      :title="getFileName(file)"
      @click="handleClick(file)"
      @contextmenu="currentEditFile = file"
    >
      <div v-if="!folder" @click.stop="handleCheck(file.id)" class="check-wrap flex-center">
        <c-icon v-if="!checkedList.includes(file.id)" name="checkbox-blank-circle-line" />
        <c-icon v-else name="checkbox-circle-fill" />
      </div>

      <img
        :src="getFileIcon(file.file_type === FileEnumType.FOLDER ? 'folder' : file.extension)"
        class="file-icon no-select"
      />
      <div class="text-center file-name mt-10 mb-10 title-color h-1x">
        {{ getFileName(file) }}
      </div>
      <div class="modify-time muted-color text-center fs-12 h-1x">
        {{ formattedTime(file.deleted_at) }}
      </div>
    </div>

    <template #content> <FileContext /> </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import FileContext from './file-context.vue'
import { getFileIcon } from '../../../utils/index'
import type { FileType } from '@/types'
import { Time } from '@wiit/vue3-helper'
import { FileEnumType } from '@/data/enum/file'
import { useRecycleStore } from '../../../stores/file-recycle'

defineProps<{
  file: FileType.FileDatum
}>()

const router = useRouter()
const { currentEditFile, checkedList, folder } = storeToRefs(useRecycleStore())

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

const formattedTime = (date: any) => {
  return Time.humanize(date, {
    threshold: 365 * 86400 * 1000,
    defaultFormat: '{yyyy}/{MM}/{dd} {HH}:{mm}'
  })
}

const handleCheck = (fileId: string) => {
  if (checkedList.value.includes(fileId)) {
    checkedList.value = checkedList.value.filter((item: string) => item !== fileId)
  } else {
    checkedList.value.push(fileId)
  }
}

const handleClick = (file: FileType.FileDatum) => {
  if (file.file_type === FileEnumType.FOLDER) {
    checkedList.value = []
    router.push({
      query: { folder: file.id }
    })
  }
}
</script>

<style lang="scss" scoped>
.folder-item-wrap {
  transition: all 0.3s;

  &.file-checked {
    background-color: var(--pure-light-bg);
    .check-wrap {
      opacity: 1;
      visibility: visible;
    }
  }

  &:hover {
    .check-wrap {
      opacity: 1;
      visibility: visible;
    }
  }

  .file-icon {
    aspect-ratio: 135/112;
  }

  .check-wrap {
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
    height: 20px;
    width: 20px;
    border-radius: 5px;
    padding: 3px;
    background-color: var(--card-bg);
    position: absolute;
    top: 5px;
    left: 5px;
    color: var(--theme-color);
  }
}
</style>

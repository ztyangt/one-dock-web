<template>
  <div
    v-loading="false"
    ref="fileTargetRef"
    class="file-list-container base-card relative flex-column flex-1 h-0 overhide scroll-h-100"
  >
    <div class="drag-wrap absolute inset-0 wh-100 br-8 no-event"></div>
    <a-scrollbar v-if="fileList?.length" class="h-100" style="overflow: auto">
      <div class="file-list-wrap relative">
        <FileItem
          @click="handleClickFile(item)"
          v-for="item in fileList"
          :key="item.id"
          :file="item"
        />

        <a-dropdown trigger="contextMenu" alignPoint :style="{ display: 'block' }">
          <div class="absolute inset-0 z-2 h-100" style="min-height: calc(100vh - 240px)"></div>
          <template #content>
            <ContextMenu />
          </template>
        </a-dropdown>
      </div>

      <div
        v-show="currentPage < totalPage"
        ref="loadmoreRef"
        class="loadmore flex-center text-center my-20 fs-12 secondary-color"
      >
        <div class="flex-yc"><span class="mr-5">加载更多</span><a-spin :size="12" /></div>
      </div>
    </a-scrollbar>

    <div v-else class="z-3 wh-100 flex-center no-event">
      <a-empty>
        <template #image>
          <c-icon class="icon-color" :size="70" name="upload-cloud-line" />
        </template>
        <span class="icon-color">拖拽文件或文件夹至此上传，支持剪切板粘贴上传</span>
      </a-empty>
    </div>

    <a-dropdown
      v-if="!fileList?.length"
      trigger="contextMenu"
      alignPoint
      :style="{ display: 'block' }"
    >
      <div class="absolute inset-0 wh-100 z-2"></div>
      <template #content>
        <ContextMenu />
      </template>
    </a-dropdown>

    <a-image-preview-group
      v-model:visible="visible"
      v-model:current="current"
      infinite
      :srcList="srcList"
    />

    <a-modal
      class="video-preview-modal"
      v-model:visible="visibleVideo"
      :footer="false"
      simple
      @beforeClose="player?.pause()"
    >
      <video
        ref="videoRef"
        controls
        autoplay
        loop
        muted
        modal-class="video-preview"
        :src="videoUrl"
      ></video>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import ContextMenu from '../context-menu/index.vue'
import FileItem from './file-item.vue'
import { getFilesFromClipboard, getFilesFromDrop } from '../../../utils'
import { useFileSelect } from '@wiit/vue3-helper'
import { RouterEmitter } from '@/emitter'
import { useIntersectionObserver } from '@vueuse/core'
import { FileEmitter } from '@/emitter'
import type { FileType } from '@/types'
import { usePlyr } from '@/hooks/use-plyr'
import { useFileListStore } from '../../../stores/file-list'
import { useFileUploadStore } from '../../../stores/file-upload'
import { debounce } from 'lodash'
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()!
const { $URL } = instance?.appContext.config.globalProperties || {}

const route = useRoute()
const fileStore = useFileListStore()
const { getFileList, loadMore, getFolderDetail } = fileStore
const { fileList, checkedList, currentPage, totalPage } = storeToRefs(fileStore)
const dragRef = useTemplateRef('fileTargetRef')
const { addFile } = useFileUploadStore()
const target = useTemplateRef<HTMLDivElement>('loadmoreRef')
const targetIsVisible = shallowRef(false)

const visible = ref(false)
const visibleVideo = ref(false)
const current = ref(0)
const videoUrl = ref()
const videoRef = useTemplateRef<HTMLVideoElement>('videoRef')

const imgExt = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tif', 'tiff']
const videoExt = [
  'mp4',
  'avi',
  'mov',
  'wmv',
  'flv',
  'mkv',
  'rmvb',
  '3gp',
  'm4v',
  'f4v',
  'webm',
  'ogg',
  'ogv',
  'm3u8'
]

const srcList = computed(() => {
  return (
    fileList.value
      // .filter((it) => imgExt.includes(it.file_ext.replace(".", "")))
      .filter((it) => imgExt.some((ext) => it.extension == ext))
      // .map((item) => `/file/${item.id}`)
      .map((item) => $URL(`/file/${item.id}`))
  )
})

const { player } = usePlyr(videoRef)

const handleClickFile = (file: FileType.FileDatum) => {
  if (imgExt.some((ext) => file.extension == ext)) {
    const index = srcList.value.findIndex((it) => it === $URL(`/file/${file.id}`))
    if (index === -1) return
    current.value = index
    visible.value = true
  } else if (videoExt.some((ext) => file.extension == ext)) {
    visibleVideo.value = true
    videoUrl.value = $URL(`/file/${file.id}`)
    player.value?.play()
  }
}

getFileList(route.query.folder as string)
getFolderDetail(route.query.folder as string)

const debounceReloadMore = debounce(() => getFileList(route.query.folder as string), 500)

FileEmitter.on('FILE:REFRESH', () => {
  debounceReloadMore()
})

const { stop } = useIntersectionObserver(target, ([entry], observerElement) => {
  targetIsVisible.value = entry?.isIntersecting || false

  if (entry?.isIntersecting) {
    handleReloadMore(route.query.folder as string)
  }
})
const handleReloadMore = (folder?: string) => {
  if (targetIsVisible.value && currentPage.value <= totalPage.value) {
    setTimeout(() => {
      loadMore(folder).then(() => {
        if (targetIsVisible.value) handleReloadMore(route.query.folder as string)
      })
    }, 300)
  }
}

RouterEmitter.on('ROUTE:CHANGE', async (route: any) => {
  checkedList.value = []
  if (route.name !== 'storage-list') return

  const { folder } = route.query || {}
  getFolderDetail(folder)
  await getFileList(folder)
  handleReloadMore(folder)
})

const handleGetFilesFromClipboard = async (e: ClipboardEvent) => {
  const result = await getFilesFromClipboard(e)
  if (result) addFile(result, route.query.folder as string)
  else Message.info('剪切板中没有文件！')
}

onMounted(() => {
  dragRef.value?.addEventListener('paste', handleGetFilesFromClipboard)
  const { initDragDom } = useFileSelect({
    dragRef: dragRef,
    dragCallback: async (e: DragEvent) => {
      const result = await getFilesFromDrop(e)
      result && addFile(result, route.query.folder as string)
    }
  })
  initDragDom()
})
onBeforeUnmount(() => {
  dragRef.value?.removeEventListener('paste', handleGetFilesFromClipboard)
  RouterEmitter.off('ROUTE:CHANGE')
})
</script>

<style lang="scss">
.video-preview-modal {
  .arco-modal {
    width: 90%;
    max-width: 1200px;
    padding: 0;
    border-radius: 10px;
    overflow: hidden;

    .arco-modal-header {
      display: none;
    }
  }
  .plyr--video {
    width: 100%;
    align-self: 16/ 9;
  }
}
.file-list-container {
  .file-list-wrap {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 20px;
    @include respond-to('sm') {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 30px;
    }
  }

  .base-card {
    &.drag-active {
      * {
        pointer-events: none;
      }
      .drag-wrap {
        display: block !important;
      }
    }
    .drag-wrap {
      display: none;
      border: 1px dashed var(--theme-color);
      background-color: var(--theme-hover-bg);
    }
  }
}
</style>

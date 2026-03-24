<template>
  <div
    v-loading="false"
    ref="fileTargetRef"
    class="file-list-container base-card relative flex-column flex-1 h-0 overhide scroll-h-100"
  >
    <div class="drag-wrap absolute inset-0 wh-100 br-8 no-event"></div>
    <a-scrollbar v-if="fileList?.length" class="h-100" style="overflow: auto">
      <div class="file-list-wrap relative">
        <FileItem v-for="item in fileList" :key="item.id" :file="item" />
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
          <c-icon class="icon-color" :size="70" name="delete-bin-7-line" />
        </template>
        <span class="icon-color">回收站空空如也...</span>
      </a-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import FileItem from './file-item.vue'
import { RouterEmitter } from '@/emitter'
import { useIntersectionObserver } from '@vueuse/core'
import { FileEmitter } from '@/emitter'
import { debounce } from 'lodash'
import { useRecycleStore } from '../../../stores/file-recycle'

const route = useRoute()
const fileStore = useRecycleStore()
const { getFileList, loadMore, getFolderDetail } = fileStore
const { fileList, currentPage, totalPage, folder, checkedList } = storeToRefs(fileStore)
const target = useTemplateRef<HTMLDivElement>('loadmoreRef')
const targetIsVisible = shallowRef(false)

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
  if (route.name !== 'storage-recycle') return

  const { folder } = route.query || {}
  getFolderDetail(folder)
  await getFileList(folder)
  handleReloadMore(folder)
})

onBeforeUnmount(() => {
  RouterEmitter.off('ROUTE:CHANGE')
})
</script>

<style lang="scss">
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

<template>
  <div class="file-transfer-page flex-column flex-1 w-0 p-15">
    <div class="flex-yc mb-20">
      <div class="text-color youshe fs-20 fw-300">传输列表</div>

      <!-- 上传 下载 完成 -->
      <div class="flex-yc ml-20">
        <a-tag
          @click="handleChangePage('upload')"
          class="card-bg pointer"
          :class="{ active: page === 'upload' }"
          >上传</a-tag
        >
        <a-tag
          @click="handleChangePage('complete')"
          class="card-bg ml-10 pointer"
          :class="{ active: page === 'complete' }"
          >已完成</a-tag
        >
      </div>
    </div>
    <component class="h-0 flex-1" :is="components[page]" />
  </div>
</template>

<script setup lang="ts">
import UploadPage from './upload/index.vue'
import DownloadPage from './download/index.vue'
import CompletePage from './complete/index.vue'
// import UploadBtn from './upload/upload-btn.vue'
import { RouterEmitter } from '@/emitter'

const route = useRoute()
const router = useRouter()
const page = ref<string>(String(route.query.page || 'upload'))

const components: Record<string, Component> = {
  upload: UploadPage,
  download: DownloadPage,
  complete: CompletePage
}

const handleChangePage = (val: string) => {
  page.value = val
  router.push({ query: { page: val } })
}

RouterEmitter.on('ROUTE:CHANGE', (route: any) => {
  page.value = route.query.page || 'upload'
})

onBeforeUnmount(() => {
  RouterEmitter.off('ROUTE:CHANGE')
})
</script>

<style lang="scss" scoped>
.active {
  color: var(--theme-color) !important;
}
</style>

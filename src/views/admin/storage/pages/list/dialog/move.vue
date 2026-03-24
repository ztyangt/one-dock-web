<template>
  <a-modal
    class="file-move-dialog"
    :visible="moveDialogVisible"
    @ok="handleOk"
    @cancel="moveDialogVisible = false"
    :width="380"
    title-align="start"
    :ok-loading="loading"
    :onClose="handleClose"
  >
    <template #title>
      将
      <span class="fw-600 mx-5 theme-color h-1x">{{
        checkedList.length > 0 ? '选中的文件' : currentEditFile?.name
      }}</span>
      <span class="flex-shrink-0 mr-20">移动到</span>
    </template>

    <a-breadcrumb class="flex-wrap">
      <a-breadcrumb-item @click="handleChangeFolder('')" class="pointer fs-12 flex-yc theme-hover">
        <c-icon name="home-5-line" class="mr-5" /> 我的文件
      </a-breadcrumb-item>
      <a-breadcrumb-item
        v-for="(item, index) in currentFolder?.parents || []"
        :key="index"
        class="pointer fs-12 theme-hover"
        @click="handleChangeFolder(item.id)"
      >
        {{ item.name }}
      </a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex-sb folder-list-wrap p-10 br-5" v-if="isCreateFolder">
      <div class="flex-yc w-100 mr-20">
        <img class="folder-list-icon mr-10" :src="getFileIcon('folder')" />
        <a-input v-model="folderName" placeholder="请输入文件夹名称" />
      </div>

      <div class="flex-yc">
        <div
          class="icon-btn mr-10 pointer flex-center br-50"
          style="background-color: var(--theme-color); padding: 3px"
          @click="handleCreateFolder"
        >
          <c-icon color="#fff" name="check-fill" :size="12" />
        </div>
        <div
          class="icon-btn pointer flex-center br-50"
          style="background-color: var(--pure-light-bg); padding: 3px"
          @click="handleCancleCreateFolder"
        >
          <c-icon name="close-line" :size="12" />
        </div>
      </div>
    </div>
    <a-scrollbar
      ref="scrollRef"
      class="mt-15"
      v-if="showFolderList.length > 0 || !currentFolder || isCreateFolder"
      :style="{
        maxHeight: '300px',
        overflow: 'auto',
        minHeight: showFolderList.length > 0 ? '150px' : '0px'
      }"
    >
      <div
        class="folder-list-wrap p-10 br-5 flex-yc pointer"
        v-for="folder in showFolderList"
        :key="folder.id"
        @click="handleChangeFolder(folder.id)"
      >
        <img class="folder-list-icon mr-10" :src="getFileIcon('folder')" />
        <span class="h-1x">{{ folder.name }}</span>
      </div>

      <!-- <div
        v-show="currentPage <= total"
        ref="loadmoreRef"
        class="loadmore flex-center text-center my-20 fs-12 secondary-color"
      >
        <div class="flex-yc"><span class="mr-5">加载中...</span><a-spin :size="12" /></div>
      </div> -->
    </a-scrollbar>

    <div
      style="height: 200px"
      v-if="currentPage <= total"
      ref="loadmoreRef"
      class="loadmore flex-center text-center my-20 fs-12 secondary-color"
    >
      <div class="flex-yc"><span class="mr-5">加载中...</span><a-spin :size="12" /></div>
    </div>

    <div
      v-if="showFolderList.length === 0 && currentPage > total"
      style="height: 200px"
      class="flex-center"
    >
      <a-empty>
        <template #image>
          <img src="@/assets/icons/empty-folder.svg" class="folder-icon no-select" />
        </template>
        该目录下暂无文件夹
      </a-empty>
    </div>

    <template #footer>
      <div class="flex-sb">
        <a-button
          type="text"
          class="mr-10"
          @click="handleStartCreateFolder"
          :disabled="isCreateFolder"
          >新建文件夹</a-button
        >

        <div class="flex-yc">
          <a-button class="mr-10" @click="moveDialogVisible = false">取消</a-button>
          <a-button type="primary" @click="handleOk">确定</a-button>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { getFileIcon } from '../../../utils'
import { storageApi } from '@/apis'
import type { FileType } from '@/types'
import { Message } from '@arco-design/web-vue'
import { FileEnumType } from '@/data/enum/file'
import { useFileListStore } from '../../../stores/file-list'

const currentFolder = ref<FileType.FileDetail>()

const store = useFileListStore()
const { moveDialogVisible, folder, currentEditFile, checkedList } = storeToRefs(store)
const loading = ref(false)
const folderList = ref<FileType.FileDatum[]>([])
const currentPage = ref(0)
const totalPage = ref(0)
const total = ref(0)

const isCreateFolder = ref(false)
const folderName = ref('')
const showFolderList = computed(() => {
  return folderList.value.filter(
    (item) => item.id !== currentEditFile.value?.id && item.file_type === FileEnumType.FOLDER
  )
})

const target = useTemplateRef<HTMLDivElement>('loadmoreRef')
const targetIsVisible = ref(false)

const scrollRef = useTemplateRef<HTMLDivElement>('scrollRef')

const handleCancleCreateFolder = () => {
  isCreateFolder.value = false
  folderName.value = ''
}

const handleCreateFolder = async () => {
  if (!folderName.value) return Message.warning('请输入文件夹名称！')
  const { code, data } = await storageApi.createFolder({
    name: folderName.value,
    parent_id: currentFolder.value?.file?.id || ''
  })
  if (code === 200) {
    folderName.value = ''
    folderList.value = []
    currentPage.value = 0
    totalPage.value = 0
    await handleReloadMore()
    isCreateFolder.value = false
  }
}

const handleStartCreateFolder = () => {
  isCreateFolder.value = true
  scrollRef.value?.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const { stop } = useIntersectionObserver(target, ([entry], observerElement) => {
  targetIsVisible.value = entry?.isIntersecting || false

  if (entry?.isIntersecting) {
    handleReloadMore()
  }
})

const loadMore = async () => {
  currentPage.value++

  const { code, data } = await storageApi.list({
    parent_id: currentFolder.value?.file?.id || '0',
    page_num: currentPage.value,
    page_size: 20,
    file_type: FileEnumType.FOLDER
  })

  if (code === 200) {
    folderList.value = [...folderList.value, ...data.records]
    totalPage.value = data.page_num
  }
}

const handleReloadMore = async () => {
  if (targetIsVisible.value && currentPage.value <= totalPage.value) {
    setTimeout(() => {
      loadMore().then(() => {
        if (targetIsVisible.value) handleReloadMore()
      })
    }, 300)
  }
}

// 获取文件夹详情
const getFolderDetail = async (folder_id?: string) => {
  if (!folder_id) {
    currentFolder.value = undefined
    return
  }
  const { code, data } = await storageApi.detail({ id: folder_id })
  if (code === 200) currentFolder.value = data
}

const handleChangeFolder = async (folder_id: string) => {
  await getFolderDetail(folder_id)
  folderList.value = []
  currentPage.value = 0
  totalPage.value = 0
  handleReloadMore()
}

watch(moveDialogVisible, (val) => {
  if (val) {
    currentFolder.value = folder.value
    currentPage.value = 0
    handleReloadMore()
  }
})

const router = useRouter()
const handleOk = async () => {
  if (!currentEditFile.value) return
  const { code } = await storageApi.move({
    ids: checkedList.value.length ? checkedList.value : [currentEditFile.value.id],
    parent_id: currentFolder.value?.file?.id || '0'
  })
  if (code === 200) {
    router.push({ query: { folder: currentFolder.value?.file?.id } })
    checkedList.value = []
    handleClose()
  }
}

const handleClose = () => {
  currentFolder.value = undefined
  folderList.value = []
  currentPage.value = 0
  totalPage.value = 0
  moveDialogVisible.value = false
}
</script>

<style lang="scss">
.file-move-dialog {
  .folder-icon {
    width: 100px;
  }

  .icon-btn {
    height: 20px;
    width: 20px;
  }

  .folder-list-icon {
    height: 20px;
  }

  .folder-list-wrap {
    &:hover {
      background-color: var(--pure-light-bg);
    }
  }

  .arco-breadcrumb-item-separator,
  .arco-breadcrumb-item {
    margin: 0;
    padding: 0;
  }
}
</style>

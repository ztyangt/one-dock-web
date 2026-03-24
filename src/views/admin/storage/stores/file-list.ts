import type { FileType } from '@/types'
import { storageApi } from '@/apis'
import Router from '@/router'
import { Message } from '@arco-design/web-vue'
import { FileEmitter } from '@/emitter'

export const useFileListStore = defineStore('file-list', () => {
  const loading = ref<boolean>(false)
  const total = ref<number>(0)
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(30)
  const totalPage = ref<number>(0)
  const fileList = ref<FileType.FileDatum[]>([])
  const folder = ref<FileType.FileDetail>() // 当前文件夹详情
  const currentEditFile = ref<FileType.FileDatum>() // 当前编辑的文件
  const createFolderDialogVisible = ref<boolean>(false) // 创建文件夹弹窗
  const renameFileDialogVisible = ref<boolean>(false) // 重命名文件弹窗
  const fileDetailDialogVisible = ref<boolean>(false) // 文件详情弹窗
  const moveDialogVisible = ref<boolean>(false) // 移动文件弹窗
  const checkedList = ref<string[]>([]) // 选中的文件列表
  const keyword = ref<string>() // 搜索关键字
  const order = ref<string>('file_type desc') // 排序方式
  const strategyId = ref<any>(0) // 存储类型

  // 获取文件列表
  const getFileList = async (folder_id?: string) => {
    currentPage.value = 1
    loading.value = true
    const { code, data } = await storageApi.list({
      page_num: currentPage.value,
      page_size: pageSize.value,
      parent_id: folder_id,
      keyword: keyword.value,
      order: order.value,
      strategy_id: strategyId.value
    })
    loading.value = false
    if (code === 200) {
      total.value = data.total
      totalPage.value = data.total
      fileList.value = data.records
    }
  }

  const loadMore = async (folder?: string) => {
    if (loading.value || currentPage.value >= totalPage.value) return
    loading.value = true
    currentPage.value++
    const { code, data } = await storageApi.list({
      page_num: currentPage.value,
      page_size: pageSize.value,
      parent_id: folder,
      keyword: keyword.value,
      order: order.value,
      strategy_id: strategyId.value
    })
    loading.value = false
    if (code === 200) {
      total.value = data.total
      totalPage.value = data.page_num
      fileList.value = [...fileList.value, ...data.records]
    }
  }

  // 获取文件夹详情
  const getFolderDetail = async (folder_id?: string) => {
    if (!folder_id) {
      folder.value = undefined
      return
    }
    const { code, data } = await storageApi.detail({ id: folder_id })
    if (code === 200) folder.value = data
  }

  // 创建文件夹
  const createFolder = async (name: string) => {
    const { code } = await storageApi.createFolder({
      name: name,
      parent_id: folder.value?.file?.id
    })
    if (code === 200) {
      createFolderDialogVisible.value = false
      getFileList(Router.currentRoute.value.query.folder as string)
    }
  }

  const moveToRecycleBin = async (file_ids: string[]) => {
    const { code } = await storageApi.remove(file_ids)
    if (code === 200) {
      FileEmitter.emit('FILE:REFRESH')
      // fileList.value = fileList.value.filter((item) => !file_ids.includes(item.id))
      // Message.success('删除成功！')
    }
  }

  return {
    total,
    fileList,
    loading,
    folder,
    currentPage,
    totalPage,
    createFolderDialogVisible,
    renameFileDialogVisible,
    fileDetailDialogVisible,
    moveDialogVisible,
    currentEditFile,
    checkedList,
    keyword,
    order,
    strategyId,
    loadMore,
    getFileList,
    getFolderDetail,
    createFolder,
    moveToRecycleBin
  }
})

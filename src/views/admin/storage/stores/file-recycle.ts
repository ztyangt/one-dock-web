import type { FileType } from '@/types'
import { storageApi } from '@/apis'
import { FileEmitter } from '@/emitter'

export const useRecycleStore = defineStore('recycle', () => {
  const loading = ref<boolean>(false)
  const total = ref<number>(0)
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(30)
  const totalPage = ref<number>(0)
  const fileList = ref<FileType.FileDatum[]>([])
  const folder = ref<FileType.FileDetail>() // 当前文件夹详情
  const checkedList = ref<string[]>([]) // 选中的文件列表
  const currentEditFile = ref<FileType.FileDatum>() // 当前编辑的文件
  const order = ref<string>('file_type desc') // 排序方式
  const fileDetailDialogVisible = ref<boolean>(false) // 文件详情弹窗是否可见

  // 获取文件列表
  const getFileList = async (folder_id?: string) => {
    currentPage.value = 1
    loading.value = true
    const { code, data } = await storageApi.list({
      page_num: currentPage.value,
      page_size: pageSize.value,
      parent_id: folder_id,
      is_trash: true,
      order: order.value
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
      is_trash: true,
      order: order.value
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
    const { code, data } = await storageApi.detail({ id: folder_id, is_trash: true })
    if (code === 200) folder.value = data
  }

  const deleteFile = async (file_ids: string[]) => {
    const { code } = await storageApi.delete(file_ids)
    if (code === 200) {
      checkedList.value = []
      FileEmitter.emit('FILE:REFRESH')
    }
  }

  const restoreFile = async (file_ids: string[]) => {
    const { code } = await storageApi.restore(file_ids)
    if (code === 200) {
      FileEmitter.emit('FILE:REFRESH')
    }
  }

  return {
    order,
    total,
    fileList,
    loading,
    folder,
    currentPage,
    totalPage,
    checkedList,
    currentEditFile,
    fileDetailDialogVisible,
    loadMore,
    deleteFile,
    getFileList,
    restoreFile,
    getFolderDetail
  }
})

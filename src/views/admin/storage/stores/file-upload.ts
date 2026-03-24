import { defineStore } from 'pinia'
import { FileUploadStatus } from '@/data/enum/file'
import { Modal } from '@arco-design/web-vue'
import { handleChunkFile } from '@/utils/upload'
import { concurrentTask, TimerTask } from '@/utils/task'
import type { FileType } from '@/types'
import { storageApi } from '@/apis'
import { FileEmitter } from '@/emitter'
import { Message } from '@arco-design/web-vue'
import { v4 as uuidv4 } from 'uuid'
import { useStorageStore } from '@/stores/storage'
import SparkMD5 from 'spark-md5'
import { parseFilenameAlternative } from '@/utils/upload'

// 分片大小
const CHUNK_SIZE = 1024 * 1024 * 5 // 5MB

// 同时上传任务数量
const PARALEL_COUNT = 3

// 同时上传分片任务数量
const PARALEL_CHUNK_COUNT = 9

interface UploadFileItem {
  uuid: string
  file: File
  chunks: FileType.FileChunk[]
  status: FileUploadStatus
  hash?: string
  progress: number
  parent_id?: string
  name?: string
  extension?: string
}

const showCancelModal = (message: string, callback: () => void) => {
  Modal.warning({
    simple: true,
    hideCancel: false,
    alignCenter: true,
    titleAlign: 'start',
    title: '提示',
    content: message,
    onOk: callback
  })
}

export const useFileUploadStore = defineStore(
  'file-upload',
  () => {
    const uploadList = ref<UploadFileItem[]>([])
    const selectedKeys = ref<string[]>([])
    const hasSelected = computed(() => selectedKeys.value.length > 0)

    const storageStore = useStorageStore()
    const { currentStrategy } = storeToRefs(storageStore)

    // 非首次上传文件列表
    const isNotFirstUpload = ref<string[]>([])

    // 文件上传任务
    const uploadTask = new concurrentTask({
      paralelCount: PARALEL_COUNT,
      immately: true
    })

    // 分片上传任务
    const uploadChunkTask = new concurrentTask({
      paralelCount: PARALEL_CHUNK_COUNT,
      immately: true
    })

    // 上传中文件列表
    const uploadingList = computed(() =>
      uploadList.value.filter((item) => item.status !== FileUploadStatus.COMPELETE)
    )

    // 已完成上传文件列表
    const uploadCompletedList = computed(() => {
      return uploadList.value.filter((item) => item.status === FileUploadStatus.COMPELETE)
    })

    // 上传文件
    const handleUploadFile = async (fileItem: UploadFileItem) => {
      fileItem.status = FileUploadStatus.UPLOADING

      // 初始化上传
      const { code, data } = await storageApi.initUpload({
        hash: fileItem.hash,
        name: fileItem.name || '',
        extension: fileItem.extension || '',
        mime_type: fileItem.file.type,
        size: fileItem.file.size,
        strategy_id: currentStrategy.value?.id,
        storage_type: currentStrategy.value?.type,
        total_parts: fileItem.chunks.length,
        parent_id: fileItem.parent_id,
        part_size: CHUNK_SIZE,
        path:
          fileItem.file.webkitRelativePath === fileItem.file.name
            ? ''
            : fileItem.file.webkitRelativePath || ''
      })

      if (code !== 200) {
        fileItem.status = FileUploadStatus.FAILED
        return
      }

      // 文件已存在，无需上传
      if (data.has_uploaded) {
        fileItem.progress = 1
        fileItem.status = FileUploadStatus.COMPELETE
        FileEmitter.emit('FILE:REFRESH')
        return
      }

      const originCount = fileItem.chunks.length
      // 移除已上传的分片
      const chunkList = fileItem.chunks
        .map((chunk, index) => ({
          ...chunk,
          part_number: index + 1
        }))
        .filter((_, index) => !data.part_list?.includes(index + 1))

      fileItem.chunks = chunkList

      let totalChunkCount = chunkList.length

      if (totalChunkCount === 0) {
        // 上传完成
        handleMergeFile(fileItem, data.id)

        return
      }

      fileItem.progress = (originCount - totalChunkCount) / originCount

      // 分片上传
      for (const chunk of chunkList) {
        const chunkTaskId = fileItem.uuid + '-' + chunk.part_number
        if (uploadChunkTask.has(chunkTaskId)) {
          continue
        }
        uploadChunkTask.add(async () => {
          const formData = new FormData()
          formData.append('chunk', chunk.blob)
          formData.append('chunk_hash', chunk.hash)
          formData.append('file_hash', fileItem.hash || '')
          formData.append('size', chunk.blob.size.toString())
          formData.append('part_number', chunk.part_number.toString())
          formData.append('task_id', data.id.toString())
          formData.append('upload_id', data.upload_id?.toString() || '')
          formData.append('strategy_id', currentStrategy.value?.id?.toString() || '')
          formData.append('strategy_type', currentStrategy.value?.type || '')

          const { code: uploadCode } = await storageApi.uploadChunk(formData)

          if (uploadCode !== 200) {
            fileItem.status = FileUploadStatus.FAILED
            return
          }

          totalChunkCount--
          fileItem.progress = (originCount - totalChunkCount) / originCount

          if (totalChunkCount === 0) {
            // 合并文件
            handleMergeFile(fileItem, data.id)
          }
        }, chunkTaskId)
      }

      isNotFirstUpload.value.push(fileItem.uuid)
    }

    const handleMergeFile = async (fileItem: UploadFileItem, id: number) => {
      const { code: mergeCode } = await storageApi.mergeChunk({ id })

      if (mergeCode !== 200) {
        fileItem.status = FileUploadStatus.FAILED
        return
      }

      FileEmitter.emit('FILE:REFRESH')
      fileItem.status = FileUploadStatus.COMPELETE
      fileItem.progress = 1
      isNotFirstUpload.value = isNotFirstUpload.value.filter((item) => item !== fileItem.uuid)
    }

    const intervalAddUploadTask = new TimerTask(1000, () => {
      const readyFiles = uploadList.value.filter(
        (item) =>
          item.status === FileUploadStatus.AWAITING && !isNotFirstUpload.value.includes(item.uuid)
      )

      for (const file of readyFiles) {
        const uploadingCount = uploadingList.value.filter(
          (item) => item.status === FileUploadStatus.UPLOADING
        ).length
        if (uploadingCount < uploadTask.paralelCount) {
          uploadTask.add(() => handleUploadFile(file), file.uuid)
        }
      }

      const awaitingFiles = uploadingList.value.filter(
        (item) =>
          item.status === FileUploadStatus.AWAITING && isNotFirstUpload.value.includes(item.uuid)
      )

      for (const file of awaitingFiles) {
        const uploadingCount = uploadingList.value.filter(
          (item) => item.status === FileUploadStatus.UPLOADING
        ).length
        if (uploadingCount < uploadTask.paralelCount) {
          file.status = FileUploadStatus.UPLOADING
        }
      }

      for (const file of uploadingList.value) {
        if (file.status === FileUploadStatus.UPLOADING) {
          for (const chunk of file.chunks) {
            const chunkTaskId = file.uuid + '-' + chunk.part_number
            uploadChunkTask.resume(chunkTaskId)
          }
        } else {
          for (const chunk of file.chunks) {
            const chunkTaskId = file.uuid + '-' + chunk.part_number
            uploadChunkTask.pause(chunkTaskId)
          }
        }
      }
    })

    intervalAddUploadTask.start()

    const statusCount = (status: FileUploadStatus) =>
      computed(() => uploadList.value.filter((item) => item.status === status).length)

    const pendingCount = computed(
      () => uploadList.value.filter((item) => item.status !== FileUploadStatus.COMPELETE).length
    )

    const addFile = (files: FileList, parent_id?: string) => {
      if (uploadingList.value.length + files.length > 100) {
        Message.info('最多只能同时上传 100 个文件！')
        return
      }

      for (const file of files) {
        // const uuid = crypto.randomUUID()
        const uuid = uuidv4()

        // 初始化上传
        const { name, ext } = parseFilenameAlternative(file.name)

        const fileObj: UploadFileItem = {
          uuid,
          file,
          chunks: [],
          status: FileUploadStatus.PREPARING,
          progress: 0,
          parent_id,
          name: name || '',
          extension: ext || ''
        }
        uploadList.value.push(fileObj)

        handleChunkFile(file, CHUNK_SIZE).then((chunks) => {
          const fileFind = uploadList.value.find((item) => item.uuid === uuid)

          if (!fileFind) return
          const hashList = chunks.map((chunk) => chunk.hash)
          fileFind.chunks = chunks
          fileFind.status = FileUploadStatus.AWAITING
          fileFind.hash = SparkMD5.hash(hashList.join(''))
          // TODO: 后续可以使用 hash 来判断文件是否存在，存在则不需要上传
        })
      }
    }

    // 更新所有文件状态
    const updateStatusForAll = (fromStatus: FileUploadStatus[], toStatus: FileUploadStatus) => {
      uploadList.value.forEach((item) => {
        if (fromStatus.includes(item.status)) {
          item.status = toStatus
        }
      })
    }

    // 更新选中文件状态
    const updateStatusForSelected = (
      fromStatus: FileUploadStatus[],
      toStatus: FileUploadStatus
    ) => {
      uploadList.value.forEach((item) => {
        if (selectedKeys.value.includes(item.uuid) && fromStatus.includes(item.status)) {
          item.status = toStatus
        }
      })
    }

    const startAll = () =>
      updateStatusForAll(
        [FileUploadStatus.PAUSE, FileUploadStatus.FAILED],
        FileUploadStatus.AWAITING
      )

    const startSelected = () =>
      updateStatusForSelected(
        [FileUploadStatus.PAUSE, FileUploadStatus.FAILED],
        FileUploadStatus.AWAITING
      )

    const pauseAll = () =>
      updateStatusForAll(
        [FileUploadStatus.UPLOADING, FileUploadStatus.AWAITING],
        FileUploadStatus.PAUSE
      )

    const pauseSelected = () =>
      updateStatusForSelected(
        [FileUploadStatus.UPLOADING, FileUploadStatus.AWAITING],
        FileUploadStatus.PAUSE
      )

    const cancelAll = () =>
      showCancelModal('确认取消所有上传任务吗？', () => {
        uploadList.value = uploadList.value.filter(
          (item) =>
            ![FileUploadStatus.AWAITING, FileUploadStatus.PAUSE, FileUploadStatus.FAILED].includes(
              item.status
            )
        )
      })

    const cancelSelected = () =>
      showCancelModal('确认取消选中的上传任务吗？', () => {
        uploadList.value = uploadList.value.filter(
          (item) =>
            !selectedKeys.value.includes(item.uuid) ||
            ![FileUploadStatus.AWAITING, FileUploadStatus.PAUSE, FileUploadStatus.FAILED].includes(
              item.status
            )
        )
        selectedKeys.value = []
      })

    const removeFile = (uuid: string) => {
      uploadList.value = uploadList.value.filter((item) => item.uuid !== uuid)
    }

    const handleStartUpload = (file: UploadFileItem) => {
      const uploadingCount = uploadingList.value.filter(
        (item) => item.status === FileUploadStatus.UPLOADING
      ).length
      if (isNotFirstUpload.value.includes(file.uuid) && uploadingCount < PARALEL_COUNT) {
        file.status = FileUploadStatus.UPLOADING
        return
      }
      file.status = FileUploadStatus.AWAITING
    }

    return {
      uploadList,
      uploadingList,
      uploadCompletedList,
      pendingCount,
      awaitingCount: statusCount(FileUploadStatus.AWAITING),
      uploadingCount: statusCount(FileUploadStatus.UPLOADING),
      pauseCount: statusCount(FileUploadStatus.PAUSE),
      failedCount: statusCount(FileUploadStatus.FAILED),
      selectedKeys,
      hasSelected,
      startAll,
      pauseAll,
      cancelAll,
      addFile,
      startSelected,
      pauseSelected,
      cancelSelected,
      removeFile,
      handleStartUpload
    }
  },
  {
    persist: {
      key: 'FILE-UPLOAD',
      pick: []
    }
  }
)

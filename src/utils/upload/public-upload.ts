// import { Message } from '@arco-design/web-vue'
// import { useFileSelect } from '@wiit/vue3-helper'
// import { parseFilenameAlternative } from './index'
// import SparkMD5 from 'spark-md5'
// import type { FileType } from '@/types'
// import { useStorageStore } from '@/stores/storage'
// import { CreateChunk } from './index'

// type publicUploadParams = {
//   path?: string
//   accept?: string[]
// }

// // 分片大小
// const CHUNK_SIZE = 1024 * 1024 * 5 // 5MB
// const { selectFile } = useFileSelect()

// export const publicUpload = async (params?: publicUploadParams) => {
//   const { path = '/', accept = [] } = params || {}
//   const filepath = 'public' + (path.startsWith('/') ? path : '/' + path)
//   const storageStore = useStorageStore()
//   const { currentStrategy } = storeToRefs(storageStore)

//   // 选择文件
//   const files = await selectFile({ accept })

//   if (files.length === 0) return
//   const file = files[0]!

//   // if (file?.size >= 1024 * 1024 * 10) {
//   //   Message.warning('文件大小不能超过20MB！')
//   //   return
//   // }

//   // 文件分片
//   const { name, ext } = parseFilenameAlternative(file.name)

//   const fileObj = {
//     file,
//     chunks: [] as FileType.FileChunk[],
//     name: name || '',
//     extension: ext || '',
//     hash: ''
//   }

//   const chunks = [] as FileType.FileChunk[]
//   for (let i = 0; i < file.size; i += CHUNK_SIZE) {
//     chunks.push(await CreateChunk(file, i, CHUNK_SIZE))
//   }

//   const hashList = chunks.map((chunk) => chunk.hash)
//   fileObj.chunks = chunks
//   const hash = SparkMD5.hash(hashList.join(''))

//   // 初始化上传
//   const { code, data } = await storageApi.initUpload({
//     hash,
//     name: name || '',
//     extension: ext || '',
//     mime_type: file.type,
//     size: file.size,
//     public: true,
//     strategy_id: currentStrategy.value?.id,
//     storage_type: currentStrategy.value?.type,
//     total_parts: chunks.length,
//     part_size: CHUNK_SIZE,
//     path: filepath
//   })

//   if (code !== 200) {
//     Message.error(data?.message || '初始化上传失败！')
//     return
//   }

//   // 文件已存在，无需上传
//   if (data.has_uploaded) {
//     return data.file_id || ''
//   }

//   // 分片上传
//   let uploadCount = 0
//   for (let i = 0; i < chunks.length; i++) {
//     const chunk = chunks[i]!
//     const formData = new FormData()
//     formData.append('chunk', chunk.blob)
//     formData.append('chunk_hash', chunk.hash)
//     formData.append('file_hash', hash || '')
//     formData.append('size', chunk.blob.size.toString())
//     formData.append('part_number', (i + 1).toString())
//     formData.append('task_id', data.id.toString())
//     formData.append('upload_id', data.upload_id?.toString() || '')
//     formData.append('strategy_id', currentStrategy.value?.id?.toString() || '')
//     formData.append('strategy_type', currentStrategy.value?.type || '')

//     const { code: uploadCode } = await storageApi.uploadChunk(formData)

//     if (uploadCode !== 200) {
//       Message.error(data?.message || '分片上传失败！')
//       break
//     }
//     uploadCount++
//   }

//   if (uploadCount === chunks.length) {
//     // 合并文件
//     const { code: mergeCode, data: mergeData } = await storageApi.mergeChunk({ id: data.id })

//     if (mergeCode !== 200) {
//       Message.error(data?.message || '合并文件失败！')
//       return
//     }
//     return mergeData?.file_id || ''
//   }
// }

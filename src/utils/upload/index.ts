import type { FileType } from '@/types'
import SparkMD5 from 'spark-md5'
import ChunkFileWorker from '@/worker/file-chunk?worker'
// import { CHUNK_SIZE } from "@/constant/file";
// import { THREAD_COUNT } from '@/constant/index'

export * from './public-upload'

/**
 * 解析文件名，分离文件名和后缀
 * @param fullName 完整文件名
 * @returns 包含文件名和后缀的对象（后缀不包含点）
 */
export function parseFilenameAlternative(fullName: string): { name: string; ext: string | null } {
  if (!fullName) {
    return { name: '', ext: null }
  }

  // 特殊情况：整个字符串都是点
  if (/^\.+$/.test(fullName)) {
    return { name: fullName, ext: null }
  }

  // 查找最后一个点的位置
  const lastDotIndex = fullName.lastIndexOf('.')

  // 如果点不存在，或者点是第一个字符（隐藏文件/无后缀情况）
  if (lastDotIndex <= 0) {
    return { name: fullName, ext: null }
  }

  // 获取点之后的部分作为后缀
  const potentialExt = fullName.substring(lastDotIndex + 1)

  // 如果后缀为空或者后缀中包含点，说明这不是有效的后缀
  // 例如: "file.." 或 "file.name.with.dots"
  if (!potentialExt || potentialExt.includes('.')) {
    return { name: fullName, ext: null }
  }

  // 如果是 .config.json 这种格式，应该返回 ".config" 作为文件名，"json" 作为后缀
  const name = fullName.substring(0, lastDotIndex)

  return { name, ext: potentialExt }
}

/**
 * 创建分片
 * @param blob 文件对象
 * @param offset 偏移量
 * @param chunk_size 分片大小
 * @returns
 */
export const CreateChunk = (
  file: File,
  offset: number,
  chunk_size: number
): Promise<FileType.FileChunk> => {
  return new Promise((resolve, reject) => {
    const blob = file.slice(offset, offset + chunk_size)
    const spark = new SparkMD5.ArrayBuffer()

    const fileReader = new FileReader()
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      spark.append(e.target!.result as ArrayBuffer)
      resolve({ blob, hash: spark.end(), offset, size: blob.size })
    }
    fileReader.onerror = () => {
      reject('文件读取失败')
    }
    fileReader.readAsArrayBuffer(blob)
  })
}

/**
 * 文件分片
 * @param file 文件对象
 * @param chunk_size 分片大小
 * @param thread_ount 线程数量
 */
export const handleChunkFile = (
  file: File,
  chunk_size: number,
  thread_count: number = 4
): Promise<FileType.FileChunk[]> => {
  return new Promise((resolve) => {
    const THREAD_COUNT = window?.navigator?.hardwareConcurrency || thread_count
    // const THREAD_COUNT = thread_count
    const chunks: Promise<FileType.FileChunk>[][] = []
    const chunkCount = Math.ceil(file.size / chunk_size)
    const threadChunkCount = Math.ceil(chunkCount / THREAD_COUNT)

    let finishCount = 0

    for (let i = 0; i < THREAD_COUNT; i++) {
      const worker = new ChunkFileWorker()
      const start = i * threadChunkCount
      const end = Math.min(start + threadChunkCount, chunkCount)

      worker.postMessage({ file, start, end, chunk_size: chunk_size })
      worker.onmessage = (e) => {
        chunks[i] = e.data as Promise<FileType.FileChunk>[]
        worker.terminate()
        finishCount++
        if (finishCount === THREAD_COUNT) {
          resolve(
            Promise.all(chunks.flat()).then((res) => {
              return res.sort((a, b) => a.offset - b.offset)
            })
          )
        }
      }
    }
  })
}

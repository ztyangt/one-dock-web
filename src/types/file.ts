import type { CommDatum } from './comm'
import { FileEnumType } from '@/data/enum/file'

export namespace FileType {
  export interface FileDatum extends CommDatum {
    id: string
    uid: string
    name: string
    origin_name: string
    path: string
    size: number
    extension: string
    storage_type: string
    uri: string
    mime_type: string
    parent_id?: string
    file_type: FileEnumType
    hash: string
  }

  export type FileDetail = {
    file: FileDatum
    size: number
    child_file_count: number
    child_folder_count: number
    parents: PathItem[]
  }

  export type PathItem = {
    name: string
    id: string
  }

  // 分片文件
  export type FileChunk = {
    part_number?: number
    blob: Blob
    hash: string
    offset: number
    size: number
  }

  // 文件上传信息
  export type FileUploadInfo = {
    file: File
    hash: string
    chunks: FileChunk[]
  }

  export type UploadFile = {
    name: string
    size: number
    hash?: string
    type?: string
    lastModified?: number
    webkitRelativePath?: string
  }

  export type UploadFolder = {
    name: string
    files?: UploadFile[]
  }
}

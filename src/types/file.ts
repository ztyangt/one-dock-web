import type { CommDatum } from './comm'
import { FileEnumType } from '@/data/enum/file'

export namespace FileType {
  export type FileType = 'image' | 'video' | 'document' | 'archive'
  export type FileStatus = '正常' | '待审核' | '已归档' | '同步中'

  export interface FileDatum {
    id: number
    name: string
    extension: string
    path: string
    bucket: string
    owner: string
    type: FileType
    typeLabel: string
    strategy: string
    providerClass: string
    size: string
    downloads: string
    status: FileStatus
    updatedAt: string
    isNew?: boolean
    tags: string[]
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

export namespace StorageStrategyType {
  export type ProviderType =
    | 'local'
    | 'cos'
    | 'oss'
    | 'kodo'
    | 'upyun'
    | 'obs'
    | 's3'

  export interface StorageStrategy {
    id: number
    name: string
    type: ProviderType
    typeLabel: string
    bucket: string
    region: string
    endpoint: string
    access_key: string
    secret_key: string
    domain: string
    path_prefix: string
    is_default: boolean
    status: 'active' | 'inactive' | 'error'
    statusLabel: string
    created_at: string
    updated_at: string
  }

  export interface StorageStrategyFormData {
    id?: number
    name: string
    type: ProviderType
    bucket: string
    region: string
    endpoint: string
    access_key: string
    secret_key: string
    domain: string
    path_prefix: string
    is_default: boolean
  }

  export interface TestConnectionResult {
    success: boolean
    message: string
  }
}

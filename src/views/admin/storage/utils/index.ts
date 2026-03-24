/**
 * 文件大小格式化
 * @param size 文件大小
 * @returns
 */
export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
}

/**
 * 从拖拽事件中获取所有文件和文件夹，返回包含完整相对路径的FileList对象
 * @param event 拖拽事件对象
 * @returns Promise<FileList> 包含所有文件的FileList对象，没有文件则返回null
 */
export async function getFilesFromDrop(event: DragEvent): Promise<FileList | null> {
  if (!event.dataTransfer || !event.dataTransfer.items || event.dataTransfer.items.length === 0) {
    return null
  }

  const items = Array.from(event.dataTransfer.items)
  const fileEntries: FileSystemEntry[] = []
  const directFiles: File[] = []

  // 首先分类处理所有拖拽项目
  for (const item of items) {
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry?.()
      if (entry) {
        fileEntries.push(entry)
      } else {
        // 处理直接拖拽的文件（非文件夹）
        const file = item.getAsFile()
        if (file) {
          directFiles.push(file)
        }
      }
    }
  }

  // 并行处理所有文件系统条目
  const collectedFiles = await Promise.all(
    fileEntries.map((entry) => collectFilesFromEntry(entry, ''))
  ).then((results) => results.flat())

  // 合并直接拖拽的文件和从条目收集的文件
  const allFiles = [...directFiles, ...collectedFiles]

  return allFiles.length > 0 ? createFileList(allFiles) : null
}

/**
 * 从剪切板读取所有文件和文件夹，返回包含完整相对路径的FileList对象
 * @param event 粘贴事件对象
 * @returns Promise<FileList> 包含所有文件的FileList对象，没有文件则返回null
 */
export async function getFilesFromClipboard(event: ClipboardEvent): Promise<FileList | null> {
  if (
    !event.clipboardData ||
    !event.clipboardData.items ||
    event.clipboardData.items.length === 0
  ) {
    return null
  }

  const items = Array.from(event.clipboardData.items)
  const fileEntries: FileSystemEntry[] = []
  const directFiles: File[] = []

  // 首先分类处理所有剪切板项目
  for (const item of items) {
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry?.()
      if (entry) {
        fileEntries.push(entry)
      } else {
        const file = item.getAsFile()
        if (file) {
          directFiles.push(file)
        }
      }
    }
  }

  // 并行处理所有文件系统条目
  const collectedFiles = await Promise.all(
    fileEntries.map((entry) => collectFilesFromEntry(entry, ''))
  ).then((results) => results.flat())

  // 合并直接复制的文件和从条目收集的文件
  const allFiles = [...directFiles, ...collectedFiles]

  return allFiles.length > 0 ? createFileList(allFiles) : null
}

/**
 * 递归收集文件系统条目中的所有文件并保留相对路径
 * @param entry 文件系统条目
 * @param relativePath 当前相对路径
 * @returns Promise<File[]> 包含所有文件的数组（带有webkitRelativePath属性）
 */
async function collectFilesFromEntry(
  entry: FileSystemEntry,
  relativePath: string
): Promise<File[]> {
  const files: File[] = []

  if (entry.isFile) {
    const file = await getFileWithRelativePath(entry as FileSystemFileEntry, relativePath)
    files.push(file)
  } else if (entry.isDirectory) {
    const dirReader = (entry as FileSystemDirectoryEntry).createReader()
    const entries = await readAllDirectoryEntries(dirReader)

    // 并行处理所有子条目以提高性能
    const subFiles = await Promise.all(
      entries.map((subEntry) =>
        collectFilesFromEntry(subEntry, relativePath ? `${relativePath}/${entry.name}` : entry.name)
      )
    )

    files.push(...subFiles.flat())
  }

  return files
}

/**
 * 读取目录中的所有条目（处理可能的分批读取）
 * @param dirReader 目录读取器
 * @returns Promise<FileSystemEntry[]> 目录中的所有条目
 */
function readAllDirectoryEntries(dirReader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve) => {
    const entries: FileSystemEntry[] = []

    const readBatch = () => {
      dirReader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(entries)
        } else {
          entries.push(...batch)
          readBatch() // 继续读取下一批
        }
      })
    }

    readBatch()
  })
}

/**
 * 从文件条目获取文件并设置相对路径
 * @param entry 文件条目
 * @param relativePath 相对路径
 * @returns Promise<File> 文件对象（带有webkitRelativePath属性）
 */
function getFileWithRelativePath(entry: FileSystemFileEntry, relativePath: string): Promise<File> {
  return new Promise((resolve) => {
    entry.file((file) => {
      const fileWithPath = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified
      })

      Object.defineProperty(fileWithPath, 'webkitRelativePath', {
        value: relativePath ? `${relativePath}/${file.name}` : file.name,
        writable: false
      })

      resolve(fileWithPath)
    })
  })
}

/**
 * 创建FileList对象
 * @param files 文件数组
 * @returns FileList 文件列表对象
 */
function createFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer()
  files.forEach((file) => dataTransfer.items.add(file))
  return dataTransfer.files
}

const fileIcons = [
  'ini',
  'rtf',
  'ico',
  'txt',
  'numbers',
  'rar',
  'docx',
  'xml',
  'js',
  'py',
  'java',
  'webm',
  'm4a (1)',
  'sql',
  'ttf',
  'dir',
  'tar',
  'tiff',
  'cpp',
  'doc',
  'zip',
  'wav',
  'json',
  'dll',
  'mkv',
  'wmv',
  'wma',
  'jar',
  'app',
  'ogv',
  'psd',
  'gif',
  'eps',
  'ogg',
  'pages',
  '7z',
  'midi',
  'csv',
  'xlsx',
  'mp4',
  'bmp',
  'ai',
  'svg',
  'css',
  'iso',
  'php',
  'apk',
  'tif',
  'odt',
  'flv',
  'mp2',
  'c',
  'dmg',
  'pdf',
  'bat',
  'log',
  'ppt',
  'woff',
  'mp3',
  'diropen',
  'mov',
  'm4a',
  'jpg',
  'html',
  'db',
  'avi',
  'wps',
  'pptx',
  'other',
  'xls',
  'folder',
  'webp',
  'png',
  'exe',
  'jpeg'
]

export function getFileIcon(ext?: string, path = 'static/images/files'): string {
  // if (fileName === "folder") return "/static/images/files/other.svg";
  const basePath = import.meta.env.APP_BASE_URL || '/'

  ext = ext?.toLowerCase() || 'other'
  if (fileIcons.includes(ext)) {
    return `${basePath}${path}/${ext}.svg`
  } else {
    return basePath + 'static/images/files/other.svg'
  }
}

export const BuildFileTree = (files: File[]) => {
  // 构建文件夹树形结构
  const tree: Record<string, any> = {}

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file || file.type === 'folder') continue
    const pathParts = file.webkitRelativePath.split('/') // 拆分路径
    let currentLevel = tree

    for (let j = 0; j < pathParts.length; j++) {
      const part = pathParts[j]
      if (!part) continue

      if (!currentLevel[part]) {
        // 如果是最后一部分，表示文件
        if (j === pathParts.length - 1) {
          currentLevel[part] = { type: 'file', file } // 存储文件对象
        } else {
          currentLevel[part] = { type: 'folder' } // 创建文件夹
        }
      }

      currentLevel = currentLevel[part] // 进入下一层级
    }
  }

  return tree
}

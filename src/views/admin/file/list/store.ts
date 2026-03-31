import type { FileType } from '@/types/file'

export const useFileListStore = defineStore('fileList', () => {
  const files = ref<FileType.FileDatum[]>([
    {
      id: 1,
      name: 'homepage-banner-summer.png',
      extension: 'PNG',
      path: '/assets/banner/homepage-banner-summer.png',
      bucket: 'marketing-assets',
      owner: '运营中心',
      type: 'image',
      typeLabel: '图片',
      strategy: '腾讯云 COS',
      providerClass: 'tencent',
      size: '2.4 MB',
      downloads: '18,420',
      status: '正常',
      updatedAt: '2026-03-28 14:25',
      isNew: true,
      tags: ['高频访问', '本周新增', '可公开访问'],
    },
    {
      id: 2,
      name: 'user-avatar-default.webp',
      extension: 'WEBP',
      path: '/assets/avatar/user-avatar-default.webp',
      bucket: 'user-center',
      owner: '用户服务',
      type: 'image',
      typeLabel: '图片',
      strategy: '华为云 OBS',
      providerClass: 'huawei',
      size: '368 KB',
      downloads: '56,002',
      status: '正常',
      updatedAt: '2026-03-27 10:18',
      tags: ['高频访问', '可公开访问'],
    },
    {
      id: 3,
      name: '产品报价单-Q2.pdf',
      extension: 'PDF',
      path: '/docs/finance/产品报价单-Q2.pdf',
      bucket: 'finance-docs',
      owner: '财务部',
      type: 'document',
      typeLabel: '文档',
      strategy: '阿里云 OSS',
      providerClass: 'aliyun',
      size: '5.6 MB',
      downloads: '824',
      status: '待审核',
      updatedAt: '2026-03-25 18:40',
      tags: ['待审核'],
    },
    {
      id: 4,
      name: 'campaign-video-launch.mp4',
      extension: 'MP4',
      path: '/media/campaign/campaign-video-launch.mp4',
      bucket: 'video-media',
      owner: '品牌市场部',
      type: 'video',
      typeLabel: '视频',
      strategy: '七牛云 Kodo',
      providerClass: 'qiniu',
      size: '186 MB',
      downloads: '6,208',
      status: '同步中',
      updatedAt: '2026-03-29 09:06',
      isNew: true,
      tags: ['本周新增'],
    },
    {
      id: 5,
      name: 'archive-order-2025-12.zip',
      extension: 'ZIP',
      path: '/backup/order/archive-order-2025-12.zip',
      bucket: 'backup-center',
      owner: '数据平台',
      type: 'archive',
      typeLabel: '压缩包',
      strategy: '本地存储',
      providerClass: 'local',
      size: '1.2 GB',
      downloads: '96',
      status: '已归档',
      updatedAt: '2026-03-20 21:11',
      tags: [],
    },
    {
      id: 6,
      name: 'supplier-contract-v8.docx',
      extension: 'DOCX',
      path: '/docs/legal/supplier-contract-v8.docx',
      bucket: 'legal-docs',
      owner: '法务部',
      type: 'document',
      typeLabel: '文档',
      strategy: '腾讯云 COS',
      providerClass: 'tencent',
      size: '1.1 MB',
      downloads: '231',
      status: '正常',
      updatedAt: '2026-03-24 15:32',
      tags: ['可公开访问'],
    },
  ])

  // ─── UI State ────────────────────────────────────────────────────────────────
  const viewMode = ref<'grid' | 'list'>('grid')
  const selectedIds = ref<number[]>([])

  // ─── Filter / Sort State ─────────────────────────────────────────────────────
  const keyword = ref('')
  const typeFilter = ref<'all' | FileType.FileType>('all')
  const strategyFilter = ref('all')
  const statusFilter = ref<'all' | FileType.FileStatus>('all')
  const sortBy = ref<'updatedAt' | 'size' | 'downloads' | 'name'>('updatedAt')
  const activeTag = ref('全部')

  // ─── Static Options ──────────────────────────────────────────────────────────
  const strategyOptions = ['腾讯云 COS', '华为云 OBS', '阿里云 OSS', '七牛云 Kodo', '本地存储']
  const tagFilters = ['全部', '高频访问', '本周新增', '待审核', '可公开访问']

  // keep these referenced so they are not tree-shaken
  void strategyOptions
  void tagFilters

  // ─── Sidebar Nav Items ────────────────────────────────────────────────────────

  // ─── Status class map ────────────────────────────────────────────────────────
  const statusClassMap: Record<FileType.FileStatus, string> = {
    正常: 'success',
    待审核: 'warning',
    已归档: 'neutral',
    同步中: 'info',
  }

  // ─── Selection helpers ───────────────────────────────────────────────────────
  const isAllSelected = computed(
    () =>
      filteredFiles.value.length > 0 &&
      filteredFiles.value.every((f) => selectedIds.value.includes(f.id)),
  )

  function toggleSelect(id: number) {
    const idx = selectedIds.value.indexOf(id)
    if (idx === -1) selectedIds.value = [...selectedIds.value, id]
    else selectedIds.value = selectedIds.value.filter((i) => i !== id)
  }

  function toggleSelectAll() {
    if (isAllSelected.value) selectedIds.value = []
    else selectedIds.value = filteredFiles.value.map((f) => f.id)
  }

  // ─── Filtering & Sorting ─────────────────────────────────────────────────────
  const filteredFiles = computed(() => {
    const result = files.value
      .filter((item) => {
        const text =
          `${item.name} ${item.path} ${item.bucket} ${item.owner} ${item.strategy}`.toLowerCase()
        const matchKeyword = !keyword.value || text.includes(keyword.value.toLowerCase())
        const matchType = typeFilter.value === 'all' || item.type === typeFilter.value
        const matchStrategy =
          strategyFilter.value === 'all' || item.strategy === strategyFilter.value
        const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value
        const matchTag = activeTag.value === '全部' || item.tags.includes(activeTag.value)
        return matchKeyword && matchType && matchStrategy && matchStatus && matchTag
      })
      .slice()

    if (sortBy.value === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortBy.value === 'downloads')
      result.sort(
        (a, b) =>
          Number.parseInt(b.downloads.replace(/,/g, '')) -
          Number.parseInt(a.downloads.replace(/,/g, '')),
      )
    else if (sortBy.value === 'size') result.sort((a, b) => b.size.length - a.size.length)
    else result.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

    return result
  })

  return {
    files,
    filteredFiles,
    statusClassMap,
    viewMode,
    keyword,
    typeFilter,
    strategyFilter,
    statusFilter,
    sortBy,
    activeTag,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
  }
})

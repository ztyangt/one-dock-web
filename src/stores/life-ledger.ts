import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  BlogArticle,
  BlogComment,
  BlogProfile,
  DailyMemo,
  DiaryEntry,
  FootprintRecord,
  InspirationNote,
  LedgerAccess,
  LifeLedgerSnapshot,
  PhotoAlbum,
  PhotoAsset,
} from '@/types/life-ledger'
import {
  createLedgerId,
  createSvgCover,
  markdownSummary,
  slugify,
  uniqueList,
} from '@/utils/life-ledger'

const now = () => new Date().toISOString()

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const ensureValue = (list: string[], value: string) => {
  const next = value.trim()
  if (!next) return list
  return list.includes(next) ? list : [...list, next]
}

const ensureValues = (list: string[], values: string[]) => {
  let next = [...list]
  values.forEach((item) => {
    next = ensureValue(next, item)
  })
  return uniqueList(next.filter(Boolean))
}

const createArticle = (payload: Partial<BlogArticle> & Pick<BlogArticle, 'title' | 'content'>): BlogArticle => {
  const createdAt = payload.createdAt || now()
  const updatedAt = payload.updatedAt || createdAt
  const slugBase = payload.slug || slugify(payload.title)
  const title = payload.title.trim() || '未命名文章'

  return {
    id: payload.id || createLedgerId('article'),
    slug: slugBase,
    title,
    summary: payload.summary?.trim() || markdownSummary(payload.content, 140),
    content: payload.content,
    cover: payload.cover || createSvgCover(title, '#38bdf8', '#818cf8'),
    category: payload.category?.trim() || '未分类',
    tags: uniqueList((payload.tags || []).map((item) => item.trim()).filter(Boolean)),
    access: payload.access || 'public',
    status: payload.status || 'draft',
    allowComments: payload.allowComments ?? true,
    views: payload.views ?? 0,
    createdAt,
    updatedAt,
    publishedAt: payload.publishedAt,
    lastAutoSavedAt: payload.lastAutoSavedAt,
    comments: payload.comments || [],
  }
}

const createMemo = (payload: Partial<DailyMemo> = {}): DailyMemo => {
  const createdAt = payload.createdAt || now()
  return {
    id: payload.id || createLedgerId('memo'),
    title: payload.title?.trim() || '',
    content: payload.content?.trim() || '',
    kind: payload.kind || 'text',
    done: payload.done ?? false,
    pinned: payload.pinned ?? false,
    archived: payload.archived ?? false,
    category: payload.category?.trim() || '日常',
    priority: payload.priority || 2,
    remindAt: payload.remindAt ?? null,
    repeat: payload.repeat || 'none',
    createdAt,
    updatedAt: payload.updatedAt || createdAt,
  }
}

const createDiary = (payload: Partial<DiaryEntry> & Pick<DiaryEntry, 'date' | 'content'>): DiaryEntry => {
  const createdAt = payload.createdAt || now()
  return {
    id: payload.id || createLedgerId('diary'),
    date: payload.date,
    title: payload.title?.trim() || `${payload.date} 的手写心情`,
    content: payload.content,
    mood: payload.mood || 'calm',
    weather: payload.weather || 'cloudy',
    keywords: uniqueList((payload.keywords || []).map((item) => item.trim()).filter(Boolean)),
    emojis: uniqueList((payload.emojis || []).filter(Boolean)),
    images: payload.images || [],
    createdAt,
    updatedAt: payload.updatedAt || createdAt,
  }
}

const createNote = (
  payload: Partial<InspirationNote> & Pick<InspirationNote, 'title' | 'content' | 'folder'>,
): InspirationNote => {
  const createdAt = payload.createdAt || now()
  const title = payload.title.trim() || '未命名灵感'
  return {
    id: payload.id || createLedgerId('note'),
    title,
    content: payload.content,
    summary: payload.summary?.trim() || markdownSummary(payload.content, 120),
    folder: payload.folder.trim() || '默认灵感夹',
    tags: uniqueList((payload.tags || []).map((item) => item.trim()).filter(Boolean)),
    starred: payload.starred ?? false,
    shareToken: payload.shareToken || createLedgerId('share'),
    images: payload.images || [],
    createdAt,
    updatedAt: payload.updatedAt || createdAt,
  }
}

const createAlbum = (payload: Partial<PhotoAlbum> & Pick<PhotoAlbum, 'name'>): PhotoAlbum => {
  const createdAt = payload.createdAt || now()
  const name = payload.name.trim() || '未命名相册'
  return {
    id: payload.id || createLedgerId('album'),
    name,
    description: payload.description?.trim() || '',
    access: payload.access || 'private',
    cover: payload.cover || createSvgCover(name, '#0ea5e9', '#22c55e'),
    createdAt,
    updatedAt: payload.updatedAt || createdAt,
  }
}

const createPhoto = (
  payload: Partial<PhotoAsset> & Pick<PhotoAsset, 'albumId' | 'title' | 'src'>,
): PhotoAsset => {
  const createdAt = payload.createdAt || now()
  return {
    id: payload.id || createLedgerId('photo'),
    albumId: payload.albumId,
    title: payload.title.trim() || '未命名照片',
    description: payload.description?.trim() || '',
    src: payload.src,
    createdAt,
    updatedAt: payload.updatedAt || createdAt,
  }
}

const createFootprint = (
  payload: Partial<FootprintRecord> &
    Pick<FootprintRecord, 'title' | 'address' | 'date' | 'lat' | 'lng'>,
): FootprintRecord => {
  const createdAt = payload.createdAt || now()
  return {
    id: payload.id || createLedgerId('footprint'),
    title: payload.title.trim() || '新的足迹',
    description: payload.description?.trim() || '',
    address: payload.address.trim() || '未命名地点',
    date: payload.date,
    lat: payload.lat,
    lng: payload.lng,
    hidden: payload.hidden ?? false,
    shared: payload.shared ?? false,
    tags: uniqueList((payload.tags || []).map((item) => item.trim()).filter(Boolean)),
    images: payload.images || [],
    createdAt,
    updatedAt: payload.updatedAt || createdAt,
  }
}

const buildDemoSnapshot = (): LifeLedgerSnapshot => {
  const blogProfile: BlogProfile = {
    title: 'ZTY 的人生手账',
    subtitle: '用文字、光影与足迹收纳每一天',
    intro:
      '这里记录我写下的博客、随手备忘、心事日记、灵感火花、温柔照片和去过的地方。它是私人的，也是可以挑选分享的。',
  }

  const albums = [
    createAlbum({
      id: 'album-city',
      name: '城市散步',
      description: '周末在城市角落里收集风、树影与街灯。',
      access: 'public',
      cover: createSvgCover('城市散步', '#60a5fa', '#38bdf8'),
      createdAt: '2025-02-16T08:30:00.000Z',
      updatedAt: '2025-02-16T08:30:00.000Z',
    }),
    createAlbum({
      id: 'album-life',
      name: '生活碎片',
      description: '餐桌、咖啡、纸页与窗边的光。',
      access: 'private',
      cover: createSvgCover('生活碎片', '#f9a8d4', '#c084fc'),
      createdAt: '2025-03-04T11:15:00.000Z',
      updatedAt: '2025-03-04T11:15:00.000Z',
    }),
  ]

  const photos = [
    createPhoto({
      id: 'photo-1',
      albumId: 'album-city',
      title: '傍晚的地铁口',
      description: '下班后抬头看到的晚霞，像温柔展开的绸缎。',
      src: createSvgCover('傍晚的地铁口', '#0ea5e9', '#fb7185'),
      createdAt: '2025-03-19T10:10:00.000Z',
      updatedAt: '2025-03-19T10:10:00.000Z',
    }),
    createPhoto({
      id: 'photo-2',
      albumId: 'album-life',
      title: '书桌与热茶',
      description: '写日记前的仪式感。',
      src: createSvgCover('书桌与热茶', '#22c55e', '#14b8a6'),
      createdAt: '2025-03-22T09:10:00.000Z',
      updatedAt: '2025-03-22T09:10:00.000Z',
    }),
    createPhoto({
      id: 'photo-3',
      albumId: 'album-city',
      title: '晚风里的天桥',
      description: '走到桥上时，风比白天更轻。',
      src: createSvgCover('晚风里的天桥', '#818cf8', '#22d3ee'),
      createdAt: '2025-03-24T18:25:00.000Z',
      updatedAt: '2025-03-24T18:25:00.000Z',
    }),
  ]

  const articles = [
    createArticle({
      id: 'article-1',
      slug: 'spring-diary-city-walk',
      title: '在春夜散步时，我重新看见了城市',
      summary:
        '把地铁口的晚霞、街灯、风声和回家的路，整理成一篇轻盈而安静的春夜散文。',
      content: `# 在春夜散步时，我重新看见了城市

春夜总是有一种特别的宽容感。

下班以后，路口的风把白天积压的疲倦一点点吹散。地铁口的人潮仍旧匆忙，但晚霞却替城市按下了慢放键。那些平时被忽略的细节——便利店门口的暖光、天桥边晃动的树影、路旁小店飘出来的饭香——忽然都变得柔软起来。

## 我重新看见的三件小事

- 路边梧桐树叶轻轻擦过彼此
- 夜色把楼宇边缘描成更温柔的线条
- 走回家的十分钟，像给心情留出的空白页

> 有时候，治愈并不是一场远行，而是一次认真走完的回家路。

![春夜城市光影](${photos[0].src})

如果你也有类似的时刻，欢迎在评论区分享你最喜欢的城市夜晚片段。`,
      cover: createSvgCover('春夜散步', '#38bdf8', '#818cf8'),
      category: '城市观察',
      tags: ['散步', '城市', '春天'],
      access: 'public',
      status: 'published',
      allowComments: true,
      views: 128,
      createdAt: '2025-03-18T09:30:00.000Z',
      updatedAt: '2025-03-22T10:30:00.000Z',
      publishedAt: '2025-03-22T10:30:00.000Z',
      comments: [
        {
          id: 'comment-1',
          author: '访客 A',
          content: '很喜欢“认真走完的回家路”这句话，读完很有画面感。',
          createdAt: '2025-03-23T12:10:00.000Z',
        },
      ],
    }),
    createArticle({
      id: 'article-2',
      slug: 'desk-ritual-and-writing',
      title: '给写作留一张安静的桌子',
      summary:
        '关于书桌整理、纸页、热茶和专注氛围的小习惯，让写作这件事回到温柔有序的状态。',
      content: `# 给写作留一张安静的桌子

写作对我来说，并不只是开始敲字。

更多时候，它从整理桌面开始：擦掉杯沿留下的水痕，摆正笔记本，把热茶放在右手边，再留一盏暖色的小灯。等这些动作完成，心也会一点点坐下来。

## 我的桌面仪式

1. 清掉无关通知
2. 打开一页空白纸张
3. 放一首不抢注意力的音乐
4. 写下今天最想记录的一件事

![书桌与热茶](${photos[1].src})

你也可以给自己建立一个小小的写作入口，它不需要复杂，但要足够稳定。`,
      cover: createSvgCover('写作桌面仪式', '#22c55e', '#14b8a6'),
      category: '个人成长',
      tags: ['写作', '习惯', '效率'],
      access: 'public',
      status: 'published',
      allowComments: false,
      views: 76,
      createdAt: '2025-03-08T08:20:00.000Z',
      updatedAt: '2025-03-09T14:08:00.000Z',
      publishedAt: '2025-03-09T14:08:00.000Z',
      comments: [],
    }),
    createArticle({
      id: 'article-3',
      slug: 'private-draft-on-summer-plan',
      title: '夏日计划清单（草稿）',
      summary: '一篇还在整理中的私人计划草稿，包含读书、旅行、拍照与规律生活。',
      content: `# 夏日计划清单

这是一篇还没有写完的草稿。

## 想做的几件事

- 读完三本想读很久的书
- 去海边看一次日出
- 用照片整理一个完整的季节
- 重新稳定运动节奏
`,
      cover: createSvgCover('夏日计划', '#f59e0b', '#ec4899'),
      category: '生活计划',
      tags: ['计划', '夏天'],
      access: 'private',
      status: 'draft',
      allowComments: false,
      views: 0,
      createdAt: '2025-03-26T08:00:00.000Z',
      updatedAt: '2025-03-26T08:00:00.000Z',
      lastAutoSavedAt: '2025-03-26T08:00:00.000Z',
      comments: [],
    }),
  ]

  const memos = [
    createMemo({
      id: 'memo-1',
      title: '补充博客封面图',
      content: '为春夜散步文章补 2 张竖图备用。',
      kind: 'todo',
      done: false,
      pinned: true,
      archived: false,
      category: '创作',
      priority: 3,
      remindAt: '2025-03-30T19:30:00.000Z',
      repeat: 'none',
      createdAt: '2025-03-27T10:00:00.000Z',
      updatedAt: '2025-03-27T10:00:00.000Z',
    }),
    createMemo({
      id: 'memo-2',
      title: '周三记得浇花',
      content: '阳台的龟背竹和薄荷都需要浇水。',
      kind: 'text',
      done: false,
      pinned: false,
      archived: false,
      category: '生活',
      priority: 1,
      remindAt: '2025-03-27T18:00:00.000Z',
      repeat: 'weekly',
      createdAt: '2025-03-25T07:20:00.000Z',
      updatedAt: '2025-03-25T07:20:00.000Z',
    }),
    createMemo({
      id: 'memo-3',
      title: '整理电脑下载文件夹',
      content: '已完成第一轮清理。',
      kind: 'todo',
      done: true,
      pinned: false,
      archived: true,
      category: '效率',
      priority: 2,
      remindAt: null,
      repeat: 'none',
      createdAt: '2025-03-14T12:00:00.000Z',
      updatedAt: '2025-03-16T08:40:00.000Z',
    }),
  ]

  const diaries = [
    createDiary({
      id: 'diary-1',
      date: '2025-03-18',
      title: '晚风很轻',
      content: `今天回家走了平时不常走的一条路。

风吹过来时，突然觉得这一天并没有想象中那么糟。地铁口的晚霞很漂亮，我站在原地看了两分钟，什么都没想，只觉得安静。

想把这种安静好好记下来。`,
      mood: 'calm',
      weather: 'sunny',
      keywords: ['晚霞', '散步', '放松'],
      emojis: ['🌆', '🍃', '🫖'],
      images: [photos[0].src],
      createdAt: '2025-03-18T13:20:00.000Z',
      updatedAt: '2025-03-18T13:20:00.000Z',
    }),
    createDiary({
      id: 'diary-2',
      date: '2025-03-22',
      title: '桌前的仪式感',
      content: `周末把书桌重新收拾了一遍。

茶杯、钢笔、便签纸、小灯，一样样摆回去，像是在替自己找回生活的秩序。写了很久没有写完的一段话，虽然不完美，但终于重新开始了。`,
      mood: 'hopeful',
      weather: 'cloudy',
      keywords: ['书桌', '写作', '周末'],
      emojis: ['📖', '☁️', '✨'],
      images: [photos[1].src],
      createdAt: '2025-03-22T09:16:00.000Z',
      updatedAt: '2025-03-22T09:16:00.000Z',
    }),
  ]

  const notes = [
    createNote({
      id: 'note-1',
      title: '播客选题：关于生活秩序感',
      folder: '内容策划',
      content: `# 生活秩序感

## 切入角度
- 为什么我们会迷恋“整理”
- 桌面与内心秩序的关系
- 微小仪式感如何帮助自己稳定下来

## 可以引用的句子
> 日常稳定下来，情绪才有地方慢慢落地。
`,
      summary: '从整理、桌面与微小仪式感切入，适合延展为一期温柔的播客脚本。',
      tags: ['播客', '选题', '生活方式'],
      starred: true,
      shareToken: 'share-note-1',
      images: [],
      createdAt: '2025-03-21T08:00:00.000Z',
      updatedAt: '2025-03-21T08:00:00.000Z',
    }),
    createNote({
      id: 'note-2',
      title: '产品灵感：足迹地图时间轴',
      folder: '产品灵感',
      content: `# 足迹地图时间轴

\`\`\`ts
type Footprint = {
  id: string
  title: string
  date: string
  lat: number
  lng: number
}
\`\`\`

- 地图与时间轴联动高亮
- 可导出旅行轨迹
- 支持公开 / 私密切换
`,
      summary: '记录一个地图与时间轴联动的轻量产品方案。',
      tags: ['产品', '地图', 'Vue'],
      starred: false,
      shareToken: 'share-note-2',
      images: [],
      createdAt: '2025-03-24T11:00:00.000Z',
      updatedAt: '2025-03-24T11:00:00.000Z',
    }),
  ]

  const footprints = [
    createFootprint({
      id: 'footprint-1',
      title: '滨江步道夜跑',
      address: '杭州·钱江新城滨江步道',
      date: '2025-03-10T19:20:00.000Z',
      lat: 30.2452,
      lng: 120.2214,
      description: '风很舒服，夜跑后在江边坐了十分钟。',
      hidden: false,
      shared: true,
      tags: ['运动', '夜景'],
      images: [createSvgCover('滨江步道夜跑', '#38bdf8', '#2563eb')],
      createdAt: '2025-03-10T19:20:00.000Z',
      updatedAt: '2025-03-10T19:20:00.000Z',
    }),
    createFootprint({
      id: 'footprint-2',
      title: '周末逛书店',
      address: '杭州·天目里书店',
      date: '2025-03-17T15:00:00.000Z',
      lat: 30.2555,
      lng: 120.1227,
      description: '看了很久摄影集，也买到一本想读的随笔。',
      hidden: false,
      shared: false,
      tags: ['阅读', '周末'],
      images: [createSvgCover('周末逛书店', '#f472b6', '#8b5cf6')],
      createdAt: '2025-03-17T15:00:00.000Z',
      updatedAt: '2025-03-17T15:00:00.000Z',
    }),
    createFootprint({
      id: 'footprint-3',
      title: '清晨看海',
      address: '宁波·东钱湖',
      date: '2025-02-22T06:40:00.000Z',
      lat: 29.7985,
      lng: 121.6327,
      description: '天刚亮的时候，湖面像被慢慢点亮。',
      hidden: true,
      shared: false,
      tags: ['旅行', '清晨'],
      images: [createSvgCover('清晨看海', '#22d3ee', '#818cf8')],
      createdAt: '2025-02-22T06:40:00.000Z',
      updatedAt: '2025-02-22T06:40:00.000Z',
    }),
  ]

  return {
    blogProfile,
    articleCategories: ['城市观察', '个人成长', '生活计划'],
    articleTags: ['散步', '城市', '春天', '写作', '习惯', '效率', '计划', '夏天'],
    memoCategories: ['生活', '创作', '效率'],
    noteFolders: ['默认灵感夹', '内容策划', '产品灵感'],
    noteTags: ['播客', '选题', '生活方式', '产品', '地图', 'Vue'],
    albums,
    photos,
    articles,
    memos,
    diaries,
    notes,
    footprints,
  }
}

export const useLifeLedgerStore = defineStore(
  'life-ledger-store',
  () => {
    const blogProfile = ref<BlogProfile>(buildDemoSnapshot().blogProfile)
    const articleCategories = ref<string[]>(buildDemoSnapshot().articleCategories)
    const articleTags = ref<string[]>(buildDemoSnapshot().articleTags)
    const memoCategories = ref<string[]>(buildDemoSnapshot().memoCategories)
    const noteFolders = ref<string[]>(buildDemoSnapshot().noteFolders)
    const noteTags = ref<string[]>(buildDemoSnapshot().noteTags)
    const albums = ref<PhotoAlbum[]>(buildDemoSnapshot().albums)
    const photos = ref<PhotoAsset[]>(buildDemoSnapshot().photos)
    const articles = ref<BlogArticle[]>(buildDemoSnapshot().articles)
    const memos = ref<DailyMemo[]>(buildDemoSnapshot().memos)
    const diaries = ref<DiaryEntry[]>(buildDemoSnapshot().diaries)
    const notes = ref<InspirationNote[]>(buildDemoSnapshot().notes)
    const footprints = ref<FootprintRecord[]>(buildDemoSnapshot().footprints)

    const publicArticles = computed(() =>
      [...articles.value]
        .filter((item) => item.access === 'public' && item.status === 'published')
        .sort(
          (a, b) =>
            +new Date(b.publishedAt || b.updatedAt || b.createdAt) -
            +new Date(a.publishedAt || a.updatedAt || a.createdAt),
        ),
    )

    const totalArticleViews = computed(() =>
      articles.value.reduce((sum, item) => sum + (item.views || 0), 0),
    )

    const memoPendingCount = computed(
      () => memos.value.filter((item) => !item.done && !item.archived).length,
    )

    const starredNoteCount = computed(() => notes.value.filter((item) => item.starred).length)

    const visibleFootprints = computed(() => footprints.value.filter((item) => !item.hidden))

    const getArticleById = (id: string) => articles.value.find((item) => item.id === id)

    const getArticleBySlug = (slug: string) => articles.value.find((item) => item.slug === slug)

    const getAlbumById = (id: string) => albums.value.find((item) => item.id === id)

    const articleExistsBySlug = (slug: string, currentId?: string) =>
      articles.value.some((item) => item.slug === slug && item.id !== currentId)

    const resolveUniqueSlug = (title: string, currentId?: string) => {
      const base = slugify(title)
      if (!articleExistsBySlug(base, currentId)) return base

      let count = 2
      let next = `${base}-${count}`
      while (articleExistsBySlug(next, currentId)) {
        count += 1
        next = `${base}-${count}`
      }
      return next
    }

    const updateBlogProfile = (payload: Partial<BlogProfile>) => {
      blogProfile.value = {
        ...blogProfile.value,
        ...payload,
      }
    }

    const setArticleCategories = (list: string[]) => {
      articleCategories.value = uniqueList(list.map((item) => item.trim()).filter(Boolean))
    }

    const setArticleTags = (list: string[]) => {
      articleTags.value = uniqueList(list.map((item) => item.trim()).filter(Boolean))
    }

    const setMemoCategories = (list: string[]) => {
      memoCategories.value = uniqueList(list.map((item) => item.trim()).filter(Boolean))
    }

    const setNoteFolders = (list: string[]) => {
      noteFolders.value = uniqueList(list.map((item) => item.trim()).filter(Boolean))
    }

    const setNoteTags = (list: string[]) => {
      noteTags.value = uniqueList(list.map((item) => item.trim()).filter(Boolean))
    }

    const upsertArticle = (payload: Partial<BlogArticle> & Pick<BlogArticle, 'title' | 'content'>) => {
      const existingIndex = payload.id
        ? articles.value.findIndex((item) => item.id === payload.id)
        : -1
      const current = existingIndex >= 0 ? articles.value[existingIndex] : undefined
      const merged = createArticle({
        ...current,
        ...payload,
        id: current?.id || payload.id,
        slug: payload.slug?.trim() || resolveUniqueSlug(payload.title, current?.id),
        summary: payload.summary?.trim() || markdownSummary(payload.content, 140),
        updatedAt: now(),
        publishedAt:
          (payload.status || current?.status) === 'published'
            ? payload.publishedAt || current?.publishedAt || now()
            : undefined,
      })

      if (existingIndex >= 0) {
        articles.value.splice(existingIndex, 1, merged)
      } else {
        articles.value.unshift(merged)
      }

      articleCategories.value = ensureValue(articleCategories.value, merged.category)
      articleTags.value = ensureValues(articleTags.value, merged.tags)

      return merged
    }

    const removeArticle = (id: string) => {
      articles.value = articles.value.filter((item) => item.id !== id)
    }

    const autosaveArticleDraft = (
      id: string,
      payload: Partial<BlogArticle> & Pick<BlogArticle, 'title' | 'content'>,
    ) => {
      const current = getArticleById(id)
      if (!current) return null

      const merged = upsertArticle({
        ...current,
        ...payload,
        id,
        status: 'draft',
        lastAutoSavedAt: now(),
      })

      return merged
    }

    const incrementArticleViews = (slug: string) => {
      const article = getArticleBySlug(slug)
      if (!article) return

      article.views += 1
      article.updatedAt = now()
    }

    const addArticleComment = (articleId: string, payload: Omit<BlogComment, 'id' | 'createdAt'>) => {
      const article = getArticleById(articleId)
      if (!article || !article.allowComments) return null

      const comment: BlogComment = {
        id: createLedgerId('comment'),
        author: payload.author.trim() || '匿名访客',
        content: payload.content.trim(),
        createdAt: now(),
      }

      if (!comment.content) return null

      article.comments.push(comment)
      article.updatedAt = now()
      return comment
    }

    const toggleArticleComments = (articleId: string, value?: boolean) => {
      const article = getArticleById(articleId)
      if (!article) return
      article.allowComments = typeof value === 'boolean' ? value : !article.allowComments
      article.updatedAt = now()
    }

    const createEmptyArticle = (): BlogArticle =>
      createArticle({
        title: '未命名文章',
        content: '',
        access: 'private',
        status: 'draft',
        allowComments: true,
        category: articleCategories.value[0] || '未分类',
        tags: [],
        summary: '',
        cover: createSvgCover('新的博客文章', '#22c55e', '#38bdf8'),
      })

    const upsertMemo = (payload: Partial<DailyMemo>) => {
      const current = payload.id ? memos.value.find((item) => item.id === payload.id) : undefined
      const merged = createMemo({
        ...current,
        ...payload,
        id: current?.id || payload.id,
        updatedAt: now(),
      })

      const index = current ? memos.value.findIndex((item) => item.id === current.id) : -1
      if (index >= 0) {
        memos.value.splice(index, 1, merged)
      } else {
        memos.value.unshift(merged)
      }

      memoCategories.value = ensureValue(memoCategories.value, merged.category)
      return merged
    }

    const toggleMemoDone = (id: string) => {
      const memo = memos.value.find((item) => item.id === id)
      if (!memo) return
      memo.done = !memo.done
      memo.updatedAt = now()
    }

    const toggleMemoPin = (id: string) => {
      const memo = memos.value.find((item) => item.id === id)
      if (!memo) return
      memo.pinned = !memo.pinned
      memo.updatedAt = now()
    }

    const toggleMemoArchive = (id: string) => {
      const memo = memos.value.find((item) => item.id === id)
      if (!memo) return
      memo.archived = !memo.archived
      memo.updatedAt = now()
    }

    const removeMemo = (id: string) => {
      memos.value = memos.value.filter((item) => item.id !== id)
    }

    const createEmptyMemo = (): DailyMemo =>
      createMemo({
        title: '',
        content: '',
        category: memoCategories.value[0] || '日常',
        kind: 'text',
        priority: 2,
        repeat: 'none',
      })

    const upsertDiary = (payload: Partial<DiaryEntry> & Pick<DiaryEntry, 'date' | 'content'>) => {
      const current = payload.id ? diaries.value.find((item) => item.id === payload.id) : undefined
      const merged = createDiary({
        ...current,
        ...payload,
        id: current?.id || payload.id,
        updatedAt: now(),
      })

      const index = current ? diaries.value.findIndex((item) => item.id === current.id) : -1
      if (index >= 0) {
        diaries.value.splice(index, 1, merged)
      } else {
        diaries.value.unshift(merged)
      }

      return merged
    }

    const removeDiary = (id: string) => {
      diaries.value = diaries.value.filter((item) => item.id !== id)
    }

    const createEmptyDiary = (date = new Date().toISOString().slice(0, 10)): DiaryEntry =>
      createDiary({
        date,
        content: '',
        title: `${date} 的心事`,
        mood: 'calm',
        weather: 'cloudy',
        keywords: [],
        emojis: [],
        images: [],
      })

    const upsertNote = (
      payload: Partial<InspirationNote> & Pick<InspirationNote, 'title' | 'content' | 'folder'>,
    ) => {
      const current = payload.id ? notes.value.find((item) => item.id === payload.id) : undefined
      const merged = createNote({
        ...current,
        ...payload,
        id: current?.id || payload.id,
        updatedAt: now(),
      })

      const index = current ? notes.value.findIndex((item) => item.id === current.id) : -1
      if (index >= 0) {
        notes.value.splice(index, 1, merged)
      } else {
        notes.value.unshift(merged)
      }

      noteFolders.value = ensureValue(noteFolders.value, merged.folder)
      noteTags.value = ensureValues(noteTags.value, merged.tags)
      return merged
    }

    const duplicateNote = (id: string) => {
      const current = notes.value.find((item) => item.id === id)
      if (!current) return null

      const duplicated = createNote({
        ...clone(current),
        id: undefined,
        title: `${current.title} - 副本`,
        shareToken: createLedgerId('share'),
        createdAt: now(),
        updatedAt: now(),
      })

      notes.value.unshift(duplicated)
      return duplicated
    }

    const toggleNoteStar = (id: string) => {
      const note = notes.value.find((item) => item.id === id)
      if (!note) return
      note.starred = !note.starred
      note.updatedAt = now()
    }

    const removeNote = (id: string) => {
      notes.value = notes.value.filter((item) => item.id !== id)
    }

    const createEmptyNote = (): InspirationNote =>
      createNote({
        title: '新的灵感笔记',
        content: '',
        folder: noteFolders.value[0] || '默认灵感夹',
        tags: [],
        images: [],
      })

    const upsertAlbum = (payload: Partial<PhotoAlbum> & Pick<PhotoAlbum, 'name'>) => {
      const current = payload.id ? albums.value.find((item) => item.id === payload.id) : undefined
      const merged = createAlbum({
        ...current,
        ...payload,
        id: current?.id || payload.id,
        updatedAt: now(),
      })

      const index = current ? albums.value.findIndex((item) => item.id === current.id) : -1
      if (index >= 0) {
        albums.value.splice(index, 1, merged)
      } else {
        albums.value.unshift(merged)
      }

      return merged
    }

    const removeAlbum = (id: string) => {
      albums.value = albums.value.filter((item) => item.id !== id)
      photos.value = photos.value.filter((item) => item.albumId !== id)
    }

    const upsertPhoto = (
      payload: Partial<PhotoAsset> & Pick<PhotoAsset, 'albumId' | 'title' | 'src'>,
    ) => {
      const current = payload.id ? photos.value.find((item) => item.id === payload.id) : undefined
      const merged = createPhoto({
        ...current,
        ...payload,
        id: current?.id || payload.id,
        updatedAt: now(),
      })

      const index = current ? photos.value.findIndex((item) => item.id === current.id) : -1
      if (index >= 0) {
        photos.value.splice(index, 1, merged)
      } else {
        photos.value.unshift(merged)
      }

      const album = getAlbumById(merged.albumId)
      if (album && !album.cover) {
        album.cover = merged.src
        album.updatedAt = now()
      }

      return merged
    }

    const movePhotosToAlbum = (photoIds: string[], albumId: string) => {
      photos.value.forEach((item) => {
        if (photoIds.includes(item.id)) {
          item.albumId = albumId
          item.updatedAt = now()
        }
      })
    }

    const renamePhoto = (id: string, title: string) => {
      const photo = photos.value.find((item) => item.id === id)
      if (!photo) return
      photo.title = title.trim() || photo.title
      photo.updatedAt = now()
    }

    const removePhoto = (id: string) => {
      photos.value = photos.value.filter((item) => item.id !== id)
    }

    const createEmptyAlbum = (): PhotoAlbum =>
      createAlbum({
        name: '新的相册',
        access: 'private',
        description: '',
      })

    const upsertFootprint = (
      payload: Partial<FootprintRecord> &
        Pick<FootprintRecord, 'title' | 'address' | 'date' | 'lat' | 'lng'>,
    ) => {
      const current = payload.id
        ? footprints.value.find((item) => item.id === payload.id)
        : undefined
      const merged = createFootprint({
        ...current,
        ...payload,
        id: current?.id || payload.id,
        updatedAt: now(),
      })

      const index = current ? footprints.value.findIndex((item) => item.id === current.id) : -1
      if (index >= 0) {
        footprints.value.splice(index, 1, merged)
      } else {
        footprints.value.unshift(merged)
      }

      return merged
    }

    const toggleFootprintHidden = (id: string) => {
      const item = footprints.value.find((record) => record.id === id)
      if (!item) return
      item.hidden = !item.hidden
      item.updatedAt = now()
    }

    const toggleFootprintShared = (id: string) => {
      const item = footprints.value.find((record) => record.id === id)
      if (!item) return
      item.shared = !item.shared
      item.updatedAt = now()
    }

    const removeFootprint = (id: string) => {
      footprints.value = footprints.value.filter((item) => item.id !== id)
    }

    const createEmptyFootprint = (): FootprintRecord =>
      createFootprint({
        title: '新的足迹',
        address: '等待填写地点',
        date: now(),
        lat: 30.2741,
        lng: 120.1551,
        tags: [],
        images: [],
      })

    const resetAll = () => {
      const snapshot = buildDemoSnapshot()
      blogProfile.value = snapshot.blogProfile
      articleCategories.value = snapshot.articleCategories
      articleTags.value = snapshot.articleTags
      memoCategories.value = snapshot.memoCategories
      noteFolders.value = snapshot.noteFolders
      noteTags.value = snapshot.noteTags
      albums.value = snapshot.albums
      photos.value = snapshot.photos
      articles.value = snapshot.articles
      memos.value = snapshot.memos
      diaries.value = snapshot.diaries
      notes.value = snapshot.notes
      footprints.value = snapshot.footprints
    }

    return {
      blogProfile,
      articleCategories,
      articleTags,
      memoCategories,
      noteFolders,
      noteTags,
      albums,
      photos,
      articles,
      memos,
      diaries,
      notes,
      footprints,
      publicArticles,
      totalArticleViews,
      memoPendingCount,
      starredNoteCount,
      visibleFootprints,
      updateBlogProfile,
      setArticleCategories,
      setArticleTags,
      setMemoCategories,
      setNoteFolders,
      setNoteTags,
      getArticleById,
      getArticleBySlug,
      resolveUniqueSlug,
      upsertArticle,
      removeArticle,
      autosaveArticleDraft,
      incrementArticleViews,
      addArticleComment,
      toggleArticleComments,
      createEmptyArticle,
      upsertMemo,
      toggleMemoDone,
      toggleMemoPin,
      toggleMemoArchive,
      removeMemo,
      createEmptyMemo,
      upsertDiary,
      removeDiary,
      createEmptyDiary,
      upsertNote,
      duplicateNote,
      toggleNoteStar,
      removeNote,
      createEmptyNote,
      upsertAlbum,
      removeAlbum,
      upsertPhoto,
      movePhotosToAlbum,
      renamePhoto,
      removePhoto,
      createEmptyAlbum,
      upsertFootprint,
      toggleFootprintHidden,
      toggleFootprintShared,
      removeFootprint,
      createEmptyFootprint,
      resetAll,
    }
  },
  {
    persist: [
      {
        key: 'LIFE-LEDGER-STORE',
        pick: [
          'blogProfile',
          'articleCategories',
          'articleTags',
          'memoCategories',
          'noteFolders',
          'noteTags',
          'albums',
          'photos',
          'articles',
          'memos',
          'diaries',
          'notes',
          'footprints',
        ],
        storage: localStorage,
      },
    ],
  },
)

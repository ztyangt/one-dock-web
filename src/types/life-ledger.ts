export type LedgerAccess = 'public' | 'private'
export type PublishStatus = 'draft' | 'published'
export type MemoRepeat = 'none' | 'daily' | 'weekly' | 'monthly'
export type MemoKind = 'text' | 'todo'
export type DiaryMood =
  | 'calm'
  | 'happy'
  | 'excited'
  | 'tired'
  | 'anxious'
  | 'sad'
  | 'hopeful'
export type DiaryWeather = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'snowy' | 'foggy'

export interface BlogComment {
  id: string
  author: string
  content: string
  createdAt: string
}

export interface BlogArticle {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  cover: string
  category: string
  tags: string[]
  access: LedgerAccess
  status: PublishStatus
  allowComments: boolean
  views: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  lastAutoSavedAt?: string
  comments: BlogComment[]
}

export interface DailyMemo {
  id: string
  title: string
  content: string
  kind: MemoKind
  done: boolean
  pinned: boolean
  archived: boolean
  category: string
  priority: 1 | 2 | 3
  remindAt: string | null
  repeat: MemoRepeat
  createdAt: string
  updatedAt: string
}

export interface DiaryEntry {
  id: string
  date: string
  title: string
  content: string
  mood: DiaryMood
  weather: DiaryWeather
  keywords: string[]
  emojis: string[]
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface InspirationNote {
  id: string
  title: string
  content: string
  summary: string
  folder: string
  tags: string[]
  starred: boolean
  shareToken: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface PhotoAlbum {
  id: string
  name: string
  description: string
  access: LedgerAccess
  cover: string
  createdAt: string
  updatedAt: string
}

export interface PhotoAsset {
  id: string
  albumId: string
  title: string
  description: string
  src: string
  createdAt: string
  updatedAt: string
}

export interface FootprintRecord {
  id: string
  title: string
  description: string
  address: string
  date: string
  lat: number
  lng: number
  hidden: boolean
  shared: boolean
  tags: string[]
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface BlogProfile {
  title: string
  subtitle: string
  intro: string
}

export interface LifeLedgerSnapshot {
  blogProfile: BlogProfile
  articleCategories: string[]
  articleTags: string[]
  memoCategories: string[]
  noteFolders: string[]
  noteTags: string[]
  albums: PhotoAlbum[]
  photos: PhotoAsset[]
  articles: BlogArticle[]
  memos: DailyMemo[]
  diaries: DiaryEntry[]
  notes: InspirationNote[]
  footprints: FootprintRecord[]
}

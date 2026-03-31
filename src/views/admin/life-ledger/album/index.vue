<template>
  <LedgerShell
    eyebrow="LIFE LEDGER / ALBUM"
    title="光影相册"
    description="打造清新优雅的时光相册：支持图片上传、批量管理、按时间 / 相册分组、自定义相册、公开 / 私密权限、图片预览、滑动查看、删除 / 重命名 / 移动。"
    :meta-list="[
      `${store.albums.length} 个相册`,
      `${store.photos.length} 张照片`,
      `${publicAlbumCount} 个公开相册`,
    ]"
  >
    <template #actions>
      <button type="button" class="page-btn ghost" @click="triggerUpload">上传图片</button>
      <button type="button" class="page-btn ghost" @click="clearSelections">清空选择</button>
      <button type="button" class="page-btn primary" @click="saveAlbum">
        {{ albumForm.id ? '保存相册' : '新建相册' }}
      </button>
    </template>

    <template #stats>
      <MetricCard
        label="相册总数"
        :value="store.albums.length"
        description="支持创建自定义相册并维护公开 / 私密权限"
        icon="🗂"
        trend="自定义管理"
        trend-tone="primary"
      />
      <MetricCard
        label="公开相册"
        :value="publicAlbumCount"
        description="公开相册可作为对外展示内容的素材来源"
        icon="🌤"
        trend="权限可控"
        trend-tone="success"
      />
      <MetricCard
        label="照片总量"
        :value="store.photos.length"
        description="支持批量上传、移动、删除与预览浏览"
        icon="🖼"
        trend="持续累积"
        trend-tone="primary"
      />
      <MetricCard
        label="批量已选"
        :value="selectedPhotoIds.length"
        description="可进行批量移动与批量删除"
        icon="☑️"
        trend="批量操作"
        trend-tone="warning"
      />
    </template>

    <template #toolbar>
      <div class="toolbar-grid">
        <label class="toolbar-field grow">
          <span>搜索图片</span>
          <input
            v-model.trim="keyword"
            class="shell-input"
            type="text"
            placeholder="搜索照片标题、描述、相册名称"
          />
        </label>

        <label class="toolbar-field">
          <span>分组方式</span>
          <select v-model="groupBy" class="shell-select">
            <option value="album">按相册分组</option>
            <option value="time">按时间分组</option>
          </select>
        </label>

        <label class="toolbar-field">
          <span>相册筛选</span>
          <select v-model="albumFilter" class="shell-select">
            <option value="all">全部相册</option>
            <option v-for="item in store.albums" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </label>

        <label class="toolbar-field">
          <span>上传到</span>
          <select v-model="uploadAlbumId" class="shell-select">
            <option v-for="item in store.albums" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </label>
      </div>
    </template>

    <section class="album-page-grid">
      <aside class="left-column">
        <article class="album-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>相册管理</h3>
              <p>创建自定义相册，设置公开 / 私密权限，并维护封面与描述。</p>
            </div>
            <button type="button" class="mini-btn ghost" @click="createFreshAlbum">新建相册</button>
          </div>

          <div class="album-list">
            <button
              v-for="item in store.albums"
              :key="item.id"
              type="button"
              class="album-item"
              :class="{ active: item.id === selectedAlbumId }"
              @click="selectAlbum(item.id)"
            >
              <img :src="item.cover" :alt="item.name" class="album-thumb" />
              <div class="album-copy">
                <div class="album-top">
                  <strong>{{ item.name }}</strong>
                  <span class="tiny-badge" :class="item.access">
                    {{ item.access === 'public' ? '公开' : '私密' }}
                  </span>
                </div>
                <p>{{ item.description || '还没有写下相册介绍。' }}</p>
                <div class="album-foot">
                  <span>{{ photoCountMap[item.id] || 0 }} 张照片</span>
                  <span>{{ formatDate(item.updatedAt) }}</span>
                </div>
              </div>
            </button>
          </div>
        </article>

        <article class="editor-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>当前相册</h3>
              <p>编辑相册名称、简介、封面和权限状态。</p>
            </div>
            <button type="button" class="mini-btn danger" @click="removeCurrentAlbum">删除相册</button>
          </div>

          <div class="form-grid">
            <label class="toolbar-field">
              <span>相册名称</span>
              <input
                v-model.trim="albumForm.name"
                class="shell-input"
                type="text"
                placeholder="例如：城市散步 / 生活碎片"
              />
            </label>

            <label class="toolbar-field">
              <span>封面地址</span>
              <input
                v-model.trim="albumForm.cover"
                class="shell-input"
                type="text"
                placeholder="未填写时默认使用当前相册封面"
              />
            </label>

            <label class="toolbar-field span-2">
              <span>相册简介</span>
              <textarea
                v-model.trim="albumForm.description"
                class="shell-textarea"
                placeholder="写下这一组光影想记录的主题与氛围"
              />
            </label>
          </div>

          <div class="switch-row">
            <div class="switch-group">
              <span class="switch-label">访问权限</span>
              <div class="option-group">
                <button
                  type="button"
                  class="option-btn"
                  :class="{ active: albumForm.access === 'public' }"
                  @click="albumForm.access = 'public'"
                >
                  公开
                </button>
                <button
                  type="button"
                  class="option-btn"
                  :class="{ active: albumForm.access === 'private' }"
                  @click="albumForm.access = 'private'"
                >
                  私密
                </button>
              </div>
            </div>
          </div>

          <div class="cover-preview">
            <img :src="albumCoverPreview" :alt="albumForm.name || 'album-cover'" />
          </div>
        </article>
      </aside>

      <section class="right-column">
        <article class="batch-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>批量管理</h3>
              <p>已选图片可批量移动到其他相册，或直接批量删除。</p>
            </div>
            <span class="count-chip">{{ selectedPhotoIds.length }} 张已选</span>
          </div>

          <div class="batch-row">
            <label class="toolbar-field grow">
              <span>移动到相册</span>
              <select v-model="batchMoveAlbumId" class="shell-select">
                <option value="">请选择目标相册</option>
                <option v-for="item in store.albums" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </label>

            <button type="button" class="mini-btn" :disabled="!selectedPhotoIds.length" @click="moveSelected">
              批量移动
            </button>
            <button
              type="button"
              class="mini-btn danger"
              :disabled="!selectedPhotoIds.length"
              @click="removeSelected"
            >
              批量删除
            </button>
          </div>
        </article>

        <article class="overview-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>浏览方式</h3>
              <p>支持按相册或按时间分组，查看每组照片的数量与更新时间。</p>
            </div>
          </div>

          <div class="overview-grid">
            <div class="overview-card">
              <span class="overview-label">当前上传目标</span>
              <strong>{{ uploadAlbumName }}</strong>
              <p>点击上传后，图片会优先进入这个相册</p>
            </div>
            <div class="overview-card">
              <span class="overview-label">当前筛选相册</span>
              <strong>{{ currentFilterLabel }}</strong>
              <p>快速聚焦某一个相册的全部照片</p>
            </div>
            <div class="overview-card">
              <span class="overview-label">当前分组模式</span>
              <strong>{{ groupBy === 'album' ? '相册分组' : '时间分组' }}</strong>
              <p>在照片较多时更适合不同整理方式</p>
            </div>
          </div>
        </article>

        <article class="photo-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>图片预览与管理</h3>
              <p>支持勾选、预览、重命名、移动和单张删除。</p>
            </div>
            <button type="button" class="mini-btn ghost" @click="triggerUpload">继续上传</button>
          </div>

          <div class="group-list">
            <section v-for="group in groupedPhotos" :key="group.key" class="photo-group">
              <div class="group-head">
                <div>
                  <strong>{{ group.title }}</strong>
                  <span>{{ group.items.length }} 张照片</span>
                </div>
                <em>{{ group.subtitle }}</em>
              </div>

              <div class="photo-grid">
                <article v-for="photo in group.items" :key="photo.id" class="photo-card">
                  <label class="select-badge" @click.stop>
                    <input
                      type="checkbox"
                      :checked="selectedPhotoIds.includes(photo.id)"
                      @change="togglePhotoSelection(photo.id)"
                    />
                    <span>选择</span>
                  </label>

                  <button type="button" class="photo-thumb-wrap" @click="openPreview(photo.id)">
                    <img :src="photo.src" :alt="photo.title" class="photo-thumb" />
                  </button>

                  <div class="photo-copy">
                    <div class="photo-top">
                      <strong>{{ photo.title }}</strong>
                      <span class="tiny-badge soft">{{ albumNameMap[photo.albumId] || '未命名相册' }}</span>
                    </div>
                    <p>{{ photo.description || '点击预览后可继续修改图片说明。' }}</p>
                    <div class="photo-meta">
                      <span>{{ formatDateTime(photo.updatedAt) }}</span>
                    </div>
                  </div>

                  <div class="photo-actions">
                    <button type="button" class="mini-icon-btn" @click="openPreview(photo.id)">预览</button>
                    <button type="button" class="mini-icon-btn" @click="startRename(photo)">重命名</button>
                    <button type="button" class="mini-icon-btn danger" @click="removePhoto(photo.id)">删除</button>
                  </div>
                </article>
              </div>
            </section>

            <div v-if="!groupedPhotos.length" class="empty-state">
              <div class="empty-icon">▣</div>
              <p>当前条件下没有照片，试试上传图片或切换筛选条件。</p>
            </div>
          </div>
        </article>
      </section>
    </section>

    <input
      ref="uploadInputRef"
      class="hidden-input"
      type="file"
      accept="image/*"
      multiple
      @change="handleUploadChange"
    />

    <div v-if="previewPhoto" class="preview-mask" @click.self="closePreview">
      <div class="preview-dialog glass-panel">
        <div class="preview-head">
          <div>
            <h3>图片预览</h3>
            <p>支持滑动查看、重命名、移动到其他相册和删除。</p>
          </div>
          <button type="button" class="mini-btn ghost" @click="closePreview">关闭</button>
        </div>

        <div class="preview-body">
          <button type="button" class="nav-btn" @click="goPrev">‹</button>

          <div class="preview-main">
            <img :src="previewPhoto.src" :alt="previewPhoto.title" class="preview-image" />

            <div class="preview-form">
              <label class="toolbar-field">
                <span>图片名称</span>
                <input v-model.trim="previewTitle" class="shell-input" type="text" />
              </label>

              <label class="toolbar-field">
                <span>图片说明</span>
                <textarea v-model.trim="previewDescription" class="shell-textarea small" />
              </label>

              <label class="toolbar-field">
                <span>移动到相册</span>
                <select v-model="previewAlbumId" class="shell-select">
                  <option v-for="item in store.albums" :key="item.id" :value="item.id">
                    {{ item.name }}
                  </option>
                </select>
              </label>

              <div class="preview-meta">
                <span>创建时间：{{ formatDateTime(previewPhoto.createdAt) }}</span>
                <span>更新时间：{{ formatDateTime(previewPhoto.updatedAt) }}</span>
              </div>

              <div class="preview-actions">
                <button type="button" class="mini-btn" @click="savePreviewMeta">保存修改</button>
                <button type="button" class="mini-btn danger" @click="removePhoto(previewPhoto.id)">删除图片</button>
              </div>
            </div>
          </div>

          <button type="button" class="nav-btn" @click="goNext">›</button>
        </div>

        <div class="preview-foot">
          <span>
            {{ previewIndex + 1 }} / {{ previewSequence.length }} ·
            {{ albumNameMap[previewPhoto.albumId] || '未命名相册' }}
          </span>
          <span>{{ previewPhoto.title }}</span>
        </div>
      </div>
    </div>

    <div v-if="renamePhotoDraft" class="rename-mask" @click.self="renamePhotoDraft = null">
      <div class="rename-dialog glass-panel">
        <div class="section-head">
          <div>
            <h3>重命名图片</h3>
            <p>为照片设置更清晰的展示名称。</p>
          </div>
        </div>

        <label class="toolbar-field mt-16">
          <span>图片名称</span>
          <input v-model.trim="renameTitle" class="shell-input" type="text" />
        </label>

        <div class="share-actions mt-18">
          <button type="button" class="mini-btn" @click="confirmRename">保存名称</button>
          <button type="button" class="mini-btn ghost" @click="renamePhotoDraft = null">取消</button>
        </div>
      </div>
    </div>
  </LedgerShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import LedgerShell from '../components/LedgerShell.vue'
import MetricCard from '../components/MetricCard.vue'
import { useLifeLedgerStore } from '@/stores/life-ledger'
import type { PhotoAlbum, PhotoAsset } from '@/types/life-ledger'
import {
  clipText,
  createSvgCover,
  formatDate,
  formatDateTime,
  formatMonthLabel,
  readFilesAsDataUrls,
  toMonthKey,
} from '@/utils/life-ledger'

type AlbumForm = {
  id?: string
  name: string
  description: string
  access: 'public' | 'private'
  cover: string
}

const store = useLifeLedgerStore()
const toast = useToast()

const keyword = ref('')
const groupBy = ref<'album' | 'time'>('album')
const albumFilter = ref('all')
const uploadAlbumId = ref(store.albums[0]?.id || '')
const selectedAlbumId = ref(store.albums[0]?.id || '')
const selectedPhotoIds = ref<string[]>([])
const batchMoveAlbumId = ref('')
const uploadInputRef = ref<HTMLInputElement>()

const previewPhotoId = ref('')
const previewTitle = ref('')
const previewDescription = ref('')
const previewAlbumId = ref('')
const renamePhotoDraft = ref<PhotoAsset | null>(null)
const renameTitle = ref('')

const albumForm = reactive<AlbumForm>({
  id: '',
  name: '',
  description: '',
  access: 'private',
  cover: '',
})

const publicAlbumCount = computed(
  () => store.albums.filter((item) => item.access === 'public').length,
)

const photoCountMap = computed(() =>
  store.albums.reduce<Record<string, number>>((acc, item) => {
    acc[item.id] = store.photos.filter((photo) => photo.albumId === item.id).length
    return acc
  }, {}),
)

const albumNameMap = computed(() =>
  store.albums.reduce<Record<string, string>>((acc, item) => {
    acc[item.id] = item.name
    return acc
  }, {}),
)

const filteredPhotos = computed(() => {
  const search = keyword.value.trim().toLowerCase()

  return [...store.photos]
    .filter((item) => {
      if (albumFilter.value !== 'all' && item.albumId !== albumFilter.value) return false

      if (!search) return true

      return [
        item.title,
        item.description,
        albumNameMap.value[item.albumId] || '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(search)
    })
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
})

const groupedPhotos = computed(() => {
  if (groupBy.value === 'album') {
    const map = new Map<string, PhotoAsset[]>()

    filteredPhotos.value.forEach((item) => {
      const group = map.get(item.albumId) || []
      group.push(item)
      map.set(item.albumId, group)
    })

    return [...map.entries()].map(([key, items]) => {
      const album = store.albums.find((item) => item.id === key)
      return {
        key,
        title: album?.name || '未命名相册',
        subtitle: album?.access === 'public' ? '公开相册' : '私密相册',
        items,
      }
    })
  }

  const map = new Map<string, PhotoAsset[]>()

  filteredPhotos.value.forEach((item) => {
    const month = toMonthKey(item.createdAt)
    const group = map.get(month) || []
    group.push(item)
    map.set(month, group)
  })

  return [...map.entries()].map(([key, items]) => ({
    key,
    title: formatMonthLabel(`${key}-01`),
    subtitle: `${items.length} 张照片`,
    items,
  }))
})

const previewSequence = computed(() => filteredPhotos.value)
const previewIndex = computed(() =>
  previewSequence.value.findIndex((item) => item.id === previewPhotoId.value),
)

const previewPhoto = computed(
  () => previewSequence.value.find((item) => item.id === previewPhotoId.value) || null,
)

const currentFilterLabel = computed(() => {
  if (albumFilter.value === 'all') return '全部相册'
  return albumNameMap.value[albumFilter.value] || '未知相册'
})

const uploadAlbumName = computed(() => albumNameMap.value[uploadAlbumId.value] || '未选择相册')

const albumCoverPreview = computed(() => {
  if (albumForm.cover.trim()) return albumForm.cover.trim()
  return createSvgCover(albumForm.name || '新的相册', '#38bdf8', '#22c55e')
})

const loadAlbumForm = (album?: PhotoAlbum) => {
  const current =
    album ||
    store.albums.find((item) => item.id === selectedAlbumId.value) ||
    store.createEmptyAlbum()

  selectedAlbumId.value = current.id
  albumForm.id = current.id
  albumForm.name = current.name
  albumForm.description = current.description
  albumForm.access = current.access
  albumForm.cover = current.cover
}

const createFreshAlbum = () => {
  const created = store.upsertAlbum(store.createEmptyAlbum())
  loadAlbumForm(created)

  if (!uploadAlbumId.value) {
    uploadAlbumId.value = created.id
  }

  toast.add({
    severity: 'info',
    summary: '已创建新的相册',
    life: 1800,
  })
}

const saveAlbum = () => {
  if (!albumForm.name.trim()) {
    toast.add({
      severity: 'warn',
      summary: '请先填写相册名称',
      life: 2200,
    })
    return
  }

  const saved = store.upsertAlbum({
    id: albumForm.id || undefined,
    name: albumForm.name.trim(),
    description: albumForm.description.trim(),
    access: albumForm.access,
    cover: albumForm.cover.trim() || createSvgCover(albumForm.name.trim(), '#38bdf8', '#22c55e'),
  })

  loadAlbumForm(saved)

  if (!uploadAlbumId.value) {
    uploadAlbumId.value = saved.id
  }

  toast.add({
    severity: 'success',
    summary: '相册已保存',
    life: 2000,
  })
}

const selectAlbum = (id: string) => {
  const target = store.albums.find((item) => item.id === id)
  if (!target) return
  loadAlbumForm(target)
}

const removeCurrentAlbum = () => {
  if (!albumForm.id) return

  const title = albumForm.name || '当前相册'
  const nextAlbum = store.albums.find((item) => item.id !== albumForm.id)

  store.removeAlbum(albumForm.id)

  if (nextAlbum) {
    loadAlbumForm(nextAlbum)
    if (uploadAlbumId.value === albumForm.id) {
      uploadAlbumId.value = nextAlbum.id
    }
  } else {
    const fresh = store.upsertAlbum(store.createEmptyAlbum())
    loadAlbumForm(fresh)
    uploadAlbumId.value = fresh.id
  }

  selectedPhotoIds.value = selectedPhotoIds.value.filter(
    (id) => store.photos.some((item) => item.id === id),
  )

  toast.add({
    severity: 'success',
    summary: `已删除相册「${title}」`,
    life: 2200,
  })
}

const triggerUpload = () => {
  if (!store.albums.length) {
    createFreshAlbum()
  }
  uploadInputRef.value?.click()
}

const handleUploadChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  if (!uploadAlbumId.value) {
    toast.add({
      severity: 'warn',
      summary: '请先选择上传目标相册',
      life: 2200,
    })
    return
  }

  const images = await readFilesAsDataUrls(input.files)

  images.forEach((src, index) => {
    const fileName = input.files?.[index]?.name?.replace(/\.[^.]+$/, '') || `图片 ${index + 1}`
    store.upsertPhoto({
      albumId: uploadAlbumId.value,
      title: fileName,
      description: '',
      src,
    })
  })

  input.value = ''

  toast.add({
    severity: 'success',
    summary: `已上传 ${images.length} 张图片`,
    life: 2200,
  })
}

const togglePhotoSelection = (id: string) => {
  if (selectedPhotoIds.value.includes(id)) {
    selectedPhotoIds.value = selectedPhotoIds.value.filter((item) => item !== id)
  } else {
    selectedPhotoIds.value = [...selectedPhotoIds.value, id]
  }
}

const clearSelections = () => {
  selectedPhotoIds.value = []
}

const moveSelected = () => {
  if (!selectedPhotoIds.value.length || !batchMoveAlbumId.value) {
    toast.add({
      severity: 'warn',
      summary: '请选择照片和目标相册',
      life: 2200,
    })
    return
  }

  store.movePhotosToAlbum(selectedPhotoIds.value, batchMoveAlbumId.value)
  selectedPhotoIds.value = []

  toast.add({
    severity: 'success',
    summary: '批量移动完成',
    life: 2000,
  })
}

const removeSelected = () => {
  if (!selectedPhotoIds.value.length) return

  selectedPhotoIds.value.forEach((id) => {
    store.removePhoto(id)
  })

  selectedPhotoIds.value = []

  toast.add({
    severity: 'success',
    summary: '已批量删除选中图片',
    life: 2000,
  })
}

const openPreview = (id: string) => {
  const target = store.photos.find((item) => item.id === id)
  if (!target) return

  previewPhotoId.value = target.id
  previewTitle.value = target.title
  previewDescription.value = target.description
  previewAlbumId.value = target.albumId
}

const closePreview = () => {
  previewPhotoId.value = ''
  previewTitle.value = ''
  previewDescription.value = ''
  previewAlbumId.value = ''
}

const syncPreviewForm = () => {
  if (!previewPhoto.value) return
  previewTitle.value = previewPhoto.value.title
  previewDescription.value = previewPhoto.value.description
  previewAlbumId.value = previewPhoto.value.albumId
}

const goPrev = () => {
  if (!previewSequence.value.length) return
  const nextIndex =
    previewIndex.value <= 0 ? previewSequence.value.length - 1 : previewIndex.value - 1
  previewPhotoId.value = previewSequence.value[nextIndex].id
  syncPreviewForm()
}

const goNext = () => {
  if (!previewSequence.value.length) return
  const nextIndex =
    previewIndex.value >= previewSequence.value.length - 1 ? 0 : previewIndex.value + 1
  previewPhotoId.value = previewSequence.value[nextIndex].id
  syncPreviewForm()
}

const savePreviewMeta = () => {
  if (!previewPhoto.value) return

  store.upsertPhoto({
    id: previewPhoto.value.id,
    albumId: previewAlbumId.value,
    title: previewTitle.value.trim() || previewPhoto.value.title,
    description: previewDescription.value.trim(),
    src: previewPhoto.value.src,
  })

  toast.add({
    severity: 'success',
    summary: '图片信息已更新',
    life: 2000,
  })
}

const startRename = (photo: PhotoAsset) => {
  renamePhotoDraft.value = photo
  renameTitle.value = photo.title
}

const confirmRename = () => {
  if (!renamePhotoDraft.value) return
  store.renamePhoto(renamePhotoDraft.value.id, renameTitle.value.trim() || renamePhotoDraft.value.title)
  renamePhotoDraft.value = null
  renameTitle.value = ''

  toast.add({
    severity: 'success',
    summary: '图片名称已更新',
    life: 2000,
  })
}

const removePhoto = (id: string) => {
  const target = store.photos.find((item) => item.id === id)
  store.removePhoto(id)
  selectedPhotoIds.value = selectedPhotoIds.value.filter((item) => item !== id)

  if (previewPhotoId.value === id) {
    if (previewSequence.value.length) {
      const next = previewSequence.value[0]
      if (next) {
        openPreview(next.id)
      } else {
        closePreview()
      }
    } else {
      closePreview()
    }
  }

  toast.add({
    severity: 'success',
    summary: `已删除图片「${target?.title || '未命名图片'}」`,
    life: 2000,
  })
}

watch(
  () => store.albums,
  (list) => {
    if (!list.length) return
    if (!selectedAlbumId.value || !list.some((item) => item.id === selectedAlbumId.value)) {
      loadAlbumForm(list[0])
    }
    if (!uploadAlbumId.value || !list.some((item) => item.id === uploadAlbumId.value)) {
      uploadAlbumId.value = list[0].id
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => previewPhotoId.value,
  () => {
    syncPreviewForm()
  },
)
</script>

<style scoped lang="scss">
.album-page-grid {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.album-panel,
.editor-panel,
.batch-panel,
.overview-panel,
.photo-panel,
.preview-dialog,
.rename-dialog {
  padding: 18px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.section-head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
}

.section-head p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.75;
  color: var(--color-text-muted);
}

.toolbar-grid,
.form-grid {
  display: grid;
  gap: 14px;
  width: 100%;
}

.toolbar-grid {
  grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 0.78fr));
}

.form-grid {
  margin-top: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.span-2 {
  grid-column: span 2;
}

.toolbar-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.toolbar-field.grow {
  min-width: 220px;
}

.toolbar-field span,
.switch-label,
.overview-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-pill-text);
}

.shell-input,
.shell-select,
.shell-textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-main);
  border-radius: 14px;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.shell-input,
.shell-select {
  min-height: 44px;
  padding: 0 14px;
}

.shell-textarea {
  min-height: 110px;
  padding: 12px 14px;
  resize: vertical;
  line-height: 1.75;
}

.shell-textarea.small {
  min-height: 94px;
}

.shell-input:focus,
.shell-select:focus,
.shell-textarea:focus {
  border-color: var(--color-primary-border);
  box-shadow:
    0 0 0 4px rgba(56, 189, 248, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.page-btn,
.mini-btn,
.option-btn,
.album-item,
.mini-icon-btn,
.nav-btn {
  transition: all 0.2s ease;
}

.page-btn,
.mini-btn,
.option-btn {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 700;
  font-size: 13px;
}

.page-btn:hover,
.mini-btn:hover,
.option-btn:hover,
.album-item:hover,
.photo-card:hover,
.mini-icon-btn:hover,
.nav-btn:hover {
  transform: translateY(-1px);
}

.page-btn.primary,
.mini-btn:not(.ghost):not(.danger) {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #fff;
  box-shadow: 0 14px 28px rgba(14, 165, 233, 0.22);
}

.page-btn.ghost,
.mini-btn.ghost,
.option-btn,
.album-item,
.photo-card,
.mini-icon-btn,
.nav-btn {
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
}

.mini-btn.danger,
.mini-icon-btn.danger {
  background: rgba(248, 113, 113, 0.12);
  color: #dc2626;
  border: 1px solid rgba(248, 113, 113, 0.2);
  box-shadow: none;
}

.option-group,
.switch-row,
.switch-group,
.batch-row,
.photo-actions,
.share-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.option-btn.active {
  color: var(--color-primary-text);
  border-color: var(--color-primary-border);
  background: var(--color-primary-bg);
}

.album-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.album-item {
  width: 100%;
  border-radius: 20px;
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 14px;
  padding: 12px;
  text-align: left;
}

.album-item.active {
  border-color: var(--color-primary-border);
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.92), rgba(255, 255, 255, 0.76));
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
}

.album-thumb {
  width: 86px;
  height: 86px;
  object-fit: cover;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  display: block;
}

.album-copy {
  min-width: 0;
}

.album-top,
.album-foot,
.photo-top,
.photo-meta,
.preview-meta,
.preview-foot,
.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.album-top strong,
.group-head strong,
.preview-head h3 {
  font-size: 16px;
  color: var(--color-text-main);
}

.album-copy p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.75;
}

.album-foot {
  margin-top: 10px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.tiny-badge,
.count-chip {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.count-chip,
.tiny-badge.soft {
  background: var(--color-tag);
  border: 1px solid var(--color-border);
  color: var(--color-pill-text);
}

.tiny-badge.public {
  color: #047857;
  background: rgba(167, 243, 208, 0.3);
  border: 1px solid rgba(167, 243, 208, 0.36);
}

.tiny-badge.private {
  color: #7c3aed;
  background: rgba(233, 213, 255, 0.34);
  border: 1px solid rgba(233, 213, 255, 0.38);
}

.switch-row {
  margin-top: 18px;
}

.cover-preview {
  margin-top: 18px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  aspect-ratio: 16 / 10;
  background: rgba(255, 255, 255, 0.8);
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.batch-row {
  margin-top: 16px;
}

.batch-row .grow {
  flex: 1;
}

.overview-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.overview-card {
  min-height: 132px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.68);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.overview-card strong {
  font-size: 28px;
  line-height: 1.2;
  color: var(--color-text-main);
}

.overview-card p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.75;
}

.group-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.photo-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.group-head {
  min-height: 42px;
}

.group-head div {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.group-head span,
.group-head em {
  font-size: 12px;
  color: var(--color-text-muted);
  font-style: normal;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.photo-card {
  position: relative;
  border-radius: 22px;
  padding: 12px;
  overflow: hidden;
}

.select-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.56);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
}

.select-badge input {
  accent-color: #38bdf8;
}

.photo-thumb-wrap {
  width: 100%;
  padding: 0;
  margin: 0;
  display: block;
  border-radius: 18px;
  overflow: hidden;
}

.photo-thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
  border-radius: 18px;
  border: 1px solid var(--color-border);
}

.photo-copy {
  margin-top: 14px;
}

.photo-top strong {
  font-size: 15px;
  color: var(--color-text-main);
}

.photo-copy p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.75;
  color: var(--color-text-muted);
  min-height: 46px;
}

.photo-meta {
  margin-top: 10px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.photo-actions {
  margin-top: 12px;
}

.mini-icon-btn {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.hidden-input {
  display: none;
}

.preview-mask,
.rename-mask {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.preview-dialog {
  width: min(1240px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
}

.preview-head p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

.preview-body {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 52px;
  gap: 14px;
  align-items: center;
}

.nav-btn {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  font-size: 24px;
  font-weight: 700;
}

.preview-main {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) 360px;
  gap: 18px;
  align-items: start;
}

.preview-image {
  width: 100%;
  border-radius: 24px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.92);
  max-height: 72vh;
  object-fit: contain;
}

.preview-form {
  padding: 16px;
  border-radius: 22px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.72);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.preview-meta {
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.preview-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preview-foot {
  margin-top: 16px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.rename-dialog {
  width: min(460px, 100%);
}

.mt-16 {
  margin-top: 16px;
}

.mt-18 {
  margin-top: 18px;
}

.empty-state {
  min-height: 240px;
  border: 1px dashed var(--color-border);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--color-text-muted);
  text-align: center;
  padding: 20px;
}

.empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: var(--color-primary-text);
  background: var(--color-primary-bg);
  font-weight: 700;
}

@media (max-width: 1380px) {
  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .preview-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1180px) {
  .album-page-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-grid,
  .overview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .photo-grid,
  .form-grid,
  .preview-body {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }

  .preview-body {
    gap: 10px;
  }

  .nav-btn {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .album-panel,
  .editor-panel,
  .batch-panel,
  .overview-panel,
  .photo-panel,
  .preview-dialog,
  .rename-dialog {
    padding: 14px;
  }

  .section-head,
  .batch-row,
  .preview-actions,
  .photo-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-btn,
  .mini-btn {
    width: 100%;
  }

  .preview-mask,
  .rename-mask {
    padding: 14px;
  }

  .album-item {
    grid-template-columns: 1fr;
  }

  .album-thumb {
    width: 100%;
    height: 180px;
  }

  .photo-grid {
    grid-template-columns: 1fr;
  }
}
</style>

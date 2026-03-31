<template>
  <LedgerShell
    eyebrow="LIFE LEDGER / NOTE"
    title="灵感笔记"
    description="支持 Markdown 编辑、清单、图片、代码片段、文件夹分类、星标收藏、全文搜索，以及笔记复制 / 分享与分享卡片生成。"
    :meta-list="[
      `${store.notes.length} 篇灵感笔记`,
      `${store.starredNoteCount} 篇星标收藏`,
      `${store.noteFolders.length} 个文件夹`,
    ]"
  >
    <template #actions>
      <button type="button" class="page-btn ghost" @click="resetForm">清空编辑器</button>
      <button type="button" class="page-btn ghost" @click="copyCurrentNote">复制笔记</button>
      <button type="button" class="page-btn primary" @click="saveNote">
        {{ noteForm.id ? '保存笔记' : '新建笔记' }}
      </button>
    </template>

    <template #stats>
      <MetricCard
        label="笔记总数"
        :value="store.notes.length"
        description="覆盖产品灵感、内容策划、代码片段与日常想法"
        icon="💡"
        trend="持续沉淀"
        trend-tone="primary"
      />
      <MetricCard
        label="星标收藏"
        :value="store.starredNoteCount"
        description="重点想法可单独标记，便于后续深挖"
        icon="⭐️"
        trend="精选清单"
        trend-tone="warning"
      />
      <MetricCard
        label="检索命中"
        :value="filteredNotes.length"
        description="支持标题、摘要、正文、标签和文件夹搜索"
        icon="🔎"
        trend="全文搜索"
        trend-tone="success"
      />
      <MetricCard
        label="当前文件夹"
        :value="activeFolderLabel"
        description="按文件夹组织灵感来源，适合长期维护"
        icon="🗃"
        trend="结构化收纳"
        trend-tone="primary"
      />
    </template>

    <template #toolbar>
      <div class="toolbar-grid">
        <label class="toolbar-field grow">
          <span>全文搜索</span>
          <input
            v-model.trim="keyword"
            class="shell-input"
            type="text"
            placeholder="搜索标题、摘要、正文、标签或文件夹"
          />
        </label>

        <label class="toolbar-field">
          <span>文件夹</span>
          <select v-model="folderFilter" class="shell-select">
            <option value="all">全部</option>
            <option v-for="item in store.noteFolders" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label class="toolbar-field">
          <span>收藏状态</span>
          <select v-model="starFilter" class="shell-select">
            <option value="all">全部</option>
            <option value="starred">仅星标</option>
            <option value="normal">未星标</option>
          </select>
        </label>
      </div>
    </template>

    <section class="note-page-grid">
      <aside class="left-column">
        <article class="folder-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>文件夹分类</h3>
              <p>按主题归档灵感笔记，适合长期整理思路。</p>
            </div>
            <button type="button" class="mini-btn" @click="saveFolderLibrary">保存文件夹</button>
          </div>

          <label class="toolbar-field mt-16">
            <span>文件夹库（逗号分隔）</span>
            <textarea
              v-model="folderLibraryInput"
              class="shell-textarea small"
              placeholder="例如：默认灵感夹, 内容策划, 产品灵感, 旅行点子"
            />
          </label>

          <div class="folder-list">
            <button
              type="button"
              class="folder-item"
              :class="{ active: folderFilter === 'all' }"
              @click="folderFilter = 'all'"
            >
              <div class="folder-main">
                <strong>全部笔记</strong>
                <span>查看所有内容</span>
              </div>
              <em>{{ store.notes.length }}</em>
            </button>

            <button
              v-for="item in store.noteFolders"
              :key="item"
              type="button"
              class="folder-item"
              :class="{ active: folderFilter === item }"
              @click="folderFilter = item"
            >
              <div class="folder-main">
                <strong>{{ item }}</strong>
                <span>{{ folderCountMap[item] || 0 }} 篇灵感</span>
              </div>
              <em>{{ folderCountMap[item] || 0 }}</em>
            </button>
          </div>
        </article>

        <article class="library-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>标签建议</h3>
              <p>统一管理常用标签，提高搜索体验与卡片信息密度。</p>
            </div>
            <button type="button" class="mini-btn" @click="saveTagLibrary">保存标签</button>
          </div>

          <label class="toolbar-field mt-16">
            <span>标签库（逗号分隔）</span>
            <textarea
              v-model="tagLibraryInput"
              class="shell-textarea small"
              placeholder="例如：产品, 地图, Vue, 内容, 生活方式"
            />
          </label>

          <div class="chip-group">
            <button
              v-for="item in store.noteTags"
              :key="item"
              type="button"
              class="tag-chip-btn"
              @click="appendTag(item)"
            >
              # {{ item }}
            </button>
          </div>
        </article>
      </aside>

      <section class="center-column">
        <article class="list-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>笔记卡片</h3>
              <p>支持星标、复制、分享、复制副本与卡片化预览。</p>
            </div>
            <div class="section-actions">
              <span class="count-chip">{{ filteredNotes.length }} 篇</span>
              <button type="button" class="mini-btn ghost" @click="createFreshNote">新建空白笔记</button>
            </div>
          </div>

          <div class="note-grid">
            <button
              v-for="item in filteredNotes"
              :key="item.id"
              type="button"
              class="note-card"
              :class="{ active: item.id === selectedNoteId, starred: item.starred }"
              @click="selectNote(item.id)"
            >
              <div class="note-card-top">
                <div class="badge-stack">
                  <span class="tiny-badge folder">{{ item.folder }}</span>
                  <span v-if="item.starred" class="tiny-badge starred">星标</span>
                </div>

                <button
                  type="button"
                  class="star-btn"
                  :class="{ active: item.starred }"
                  @click.stop="toggleStar(item.id)"
                >
                  {{ item.starred ? '★' : '☆' }}
                </button>
              </div>

              <h4>{{ item.title }}</h4>
              <p>{{ item.summary || markdownSummary(item.content, 90) }}</p>

              <div class="card-tags">
                <span v-for="tag in item.tags.slice(0, 4)" :key="tag" class="card-tag"># {{ tag }}</span>
              </div>

              <div class="code-preview">
                <pre>{{ extractSnippet(item.content) }}</pre>
              </div>

              <div class="note-card-foot">
                <span>{{ item.images.length }} 张图片</span>
                <span>{{ formatDate(item.updatedAt) }}</span>
              </div>

              <div class="quick-actions" @click.stop>
                <button type="button" class="mini-icon-btn" @click="copyNote(item)">复制</button>
                <button type="button" class="mini-icon-btn" @click="duplicate(item.id)">副本</button>
                <button type="button" class="mini-icon-btn" @click="openShareCard(item.id)">分享</button>
                <button type="button" class="mini-icon-btn danger" @click="removeNote(item.id)">删除</button>
              </div>
            </button>

            <div v-if="!filteredNotes.length" class="empty-state">
              <div class="empty-icon">✦</div>
              <p>当前条件下没有灵感笔记，试试新建一篇或调整搜索条件。</p>
            </div>
          </div>
        </article>
      </section>

      <section class="right-column">
        <article class="editor-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>笔记编辑器</h3>
              <p>支持 Markdown、清单、代码片段、图片、复制和分享卡片。</p>
            </div>

            <div class="editor-actions">
              <button type="button" class="mini-btn ghost" @click="duplicate(noteForm.id)">复制副本</button>
              <button type="button" class="mini-btn ghost" @click="openShareCard(noteForm.id)">分享卡片</button>
              <button type="button" class="mini-btn danger" @click="removeCurrentNote">删除笔记</button>
            </div>
          </div>

          <div class="form-grid">
            <label class="toolbar-field span-2">
              <span>标题</span>
              <input
                v-model.trim="noteForm.title"
                class="shell-input"
                type="text"
                placeholder="例如：足迹地图时间轴 / 播客选题 / 新产品方向"
              />
            </label>

            <label class="toolbar-field">
              <span>文件夹</span>
              <input
                v-model.trim="noteForm.folder"
                class="shell-input"
                list="note-folder-list"
                type="text"
                placeholder="输入或选择文件夹"
              />
            </label>

            <label class="toolbar-field">
              <span>标签（逗号分隔）</span>
              <input
                v-model="noteTagsInput"
                class="shell-input"
                type="text"
                placeholder="例如：产品, Vue, 内容"
              />
            </label>

            <label class="toolbar-field span-2">
              <span>摘要</span>
              <textarea
                v-model.trim="noteForm.summary"
                class="shell-textarea small"
                placeholder="可留空，保存时将自动从正文中提炼摘要"
              />
            </label>
          </div>

          <div class="toggle-row">
            <label class="toggle-pill">
              <input v-model="noteForm.starred" type="checkbox" />
              <span>加入星标收藏</span>
            </label>

            <div class="share-token">
              <span>分享标识</span>
              <strong>{{ noteForm.shareToken || '未生成' }}</strong>
            </div>
          </div>

          <datalist id="note-folder-list">
            <option v-for="item in store.noteFolders" :key="item" :value="item" />
          </datalist>
        </article>

        <MarkdownWorkbench
          v-model="noteForm.content"
          title="灵感正文"
          description="支持待办清单、代码块、图片、链接和实时预览，适合产品方案、脚本草稿和随手灵感。"
          helper-text="可以先快速记录，再通过文件夹和标签做二次整理。"
          :min-height="440"
        />

        <div class="bottom-grid">
          <article class="assets-panel glass-panel">
            <div class="section-head">
              <div>
                <h3>图片补充</h3>
                <p>可额外收集灵感参考图，用于分享卡片和笔记封面。</p>
              </div>
              <button type="button" class="mini-btn ghost" @click="triggerImageInput">上传图片</button>
            </div>

            <input
              ref="imageInputRef"
              class="hidden-input"
              type="file"
              accept="image/*"
              multiple
              @change="handleImageChange"
            />

            <div v-if="noteForm.images.length" class="image-grid">
              <div v-for="(item, index) in noteForm.images" :key="`${item}-${index}`" class="image-card">
                <img :src="item" :alt="`note-${index}`" />
                <button type="button" class="remove-image-btn" @click="removeImage(index)">×</button>
              </div>
            </div>
            <div v-else class="empty-inline">还没有附加图片，可上传参考图、页面截图或灵感照片。</div>
          </article>

          <article class="share-preview glass-panel">
            <div class="section-head">
              <div>
                <h3>分享卡片预览</h3>
                <p>用于复制分享文案或展示灵感摘要卡片。</p>
              </div>
            </div>

            <div class="share-card-demo">
              <div class="share-card-header">
                <span class="share-mark">灵感笔记</span>
                <span>{{ noteForm.folder || '默认灵感夹' }}</span>
              </div>

              <h4>{{ noteForm.title || '新的灵感笔记' }}</h4>
              <p>{{ noteSummaryPreview }}</p>

              <div class="share-tags">
                <span v-for="tag in parsedTags.slice(0, 4)" :key="tag" class="share-tag"># {{ tag }}</span>
              </div>

              <div class="share-foot">
                <span>{{ noteForm.starred ? '★ 星标收藏' : '☆ 普通笔记' }}</span>
                <span>{{ noteForm.shareToken || '等待生成分享标识' }}</span>
              </div>
            </div>

            <div class="share-actions">
              <button type="button" class="mini-btn" @click="copyCurrentNote">复制全文</button>
              <button type="button" class="mini-btn ghost" @click="copyShareText">复制分享文案</button>
              <button type="button" class="mini-btn ghost" @click="openShareCard(noteForm.id)">打开卡片</button>
            </div>
          </article>
        </div>
      </section>
    </section>

    <div v-if="shareCardVisible" class="share-modal-mask" @click.self="shareCardVisible = false">
      <div class="share-modal glass-panel">
        <div class="section-head">
          <div>
            <h3>灵感分享卡片</h3>
            <p>可以复制分享文案、截图卡片，或直接继续完善当前笔记。</p>
          </div>
          <button type="button" class="mini-btn ghost" @click="shareCardVisible = false">关闭</button>
        </div>

        <div class="share-card-large">
          <div class="share-card-header">
            <span class="share-mark">LIFE LEDGER</span>
            <span>{{ currentShareNote?.folder || noteForm.folder || '默认灵感夹' }}</span>
          </div>

          <h4>{{ currentShareNote?.title || noteForm.title || '新的灵感笔记' }}</h4>
          <p>{{ currentShareSummary }}</p>

          <div class="share-tags">
            <span
              v-for="tag in currentShareTags.slice(0, 6)"
              :key="tag"
              class="share-tag"
            >
              # {{ tag }}
            </span>
          </div>

          <div class="share-copy">
            <pre>{{ shareText }}</pre>
          </div>
        </div>

        <div class="share-actions mt-18">
          <button type="button" class="mini-btn" @click="copyShareText">复制分享文案</button>
          <button type="button" class="mini-btn ghost" @click="copyCurrentNote">复制完整 Markdown</button>
          <button type="button" class="mini-btn ghost" @click="shareCardVisible = false">返回编辑</button>
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
import MarkdownWorkbench from '../components/MarkdownWorkbench.vue'
import { useLifeLedgerStore } from '@/stores/life-ledger'
import type { InspirationNote } from '@/types/life-ledger'
import {
  clipText,
  copyText,
  extractPlainText,
  formatDate,
  markdownSummary,
  normalizeKeywordList,
  readFilesAsDataUrls,
} from '@/utils/life-ledger'

type NoteForm = {
  id?: string
  title: string
  folder: string
  summary: string
  content: string
  starred: boolean
  shareToken: string
  images: string[]
}

const store = useLifeLedgerStore()
const toast = useToast()

const keyword = ref('')
const folderFilter = ref('all')
const starFilter = ref<'all' | 'starred' | 'normal'>('all')
const selectedNoteId = ref(store.notes[0]?.id || '')
const folderLibraryInput = ref(store.noteFolders.join(', '))
const tagLibraryInput = ref(store.noteTags.join(', '))
const noteTagsInput = ref('')
const imageInputRef = ref<HTMLInputElement>()
const shareCardVisible = ref(false)
const shareTargetId = ref('')

const noteForm = reactive<NoteForm>({
  id: '',
  title: '',
  folder: store.noteFolders[0] || '默认灵感夹',
  summary: '',
  content: '',
  starred: false,
  shareToken: '',
  images: [],
})

const activeFolderLabel = computed(() => (folderFilter.value === 'all' ? '全部' : folderFilter.value))

const folderCountMap = computed(() =>
  store.noteFolders.reduce<Record<string, number>>((acc, item) => {
    acc[item] = store.notes.filter((note) => note.folder === item).length
    return acc
  }, {}),
)

const parsedTags = computed(() => normalizeKeywordList(noteTagsInput.value))

const filteredNotes = computed(() => {
  const search = keyword.value.trim().toLowerCase()

  return [...store.notes]
    .filter((item) => {
      if (folderFilter.value !== 'all' && item.folder !== folderFilter.value) return false
      if (starFilter.value === 'starred' && !item.starred) return false
      if (starFilter.value === 'normal' && item.starred) return false

      if (!search) return true

      return [item.title, item.summary, item.content, item.tags.join(' '), item.folder]
        .join(' ')
        .toLowerCase()
        .includes(search)
    })
    .sort((a, b) => {
      if (a.starred !== b.starred) return Number(b.starred) - Number(a.starred)
      return +new Date(b.updatedAt) - +new Date(a.updatedAt)
    })
})

const currentShareNote = computed(() => {
  if (!shareTargetId.value) return null
  return store.notes.find((item) => item.id === shareTargetId.value) || null
})

const noteSummaryPreview = computed(
  () => noteForm.summary.trim() || markdownSummary(noteForm.content || noteForm.title || '等待补充灵感内容。', 110),
)

const currentShareSummary = computed(() => {
  if (currentShareNote.value) {
    return currentShareNote.value.summary || markdownSummary(currentShareNote.value.content, 130)
  }
  return noteSummaryPreview.value
})

const currentShareTags = computed(() => {
  if (currentShareNote.value) return currentShareNote.value.tags
  return parsedTags.value
})

const shareText = computed(() => {
  const source = currentShareNote.value
  const title = source?.title || noteForm.title || '新的灵感笔记'
  const folder = source?.folder || noteForm.folder || '默认灵感夹'
  const token = source?.shareToken || noteForm.shareToken || 'waiting-share-token'
  const summary = currentShareSummary.value
  const tags = currentShareTags.value.length ? currentShareTags.value.map((item) => `#${item}`).join(' ') : '#灵感笔记'

  return `【灵感笔记】${title}
文件夹：${folder}
摘要：${summary}
标签：${tags}
分享标识：${token}`
})

const extractSnippet = (content: string) => {
  const match = content.match(/```[\s\S]*?```/)
  if (match?.[0]) {
    return clipText(match[0], 100)
  }
  return clipText(extractPlainText(content), 88)
}

const appendTag = (tag: string) => {
  const tags = normalizeKeywordList(noteTagsInput.value)
  if (!tags.includes(tag)) {
    tags.push(tag)
  }
  noteTagsInput.value = tags.join(', ')
}

const loadNote = (note?: InspirationNote) => {
  const current =
    note ||
    store.notes.find((item) => item.id === selectedNoteId.value) ||
    store.createEmptyNote()

  selectedNoteId.value = current.id
  noteForm.id = current.id
  noteForm.title = current.title
  noteForm.folder = current.folder
  noteForm.summary = current.summary
  noteForm.content = current.content
  noteForm.starred = current.starred
  noteForm.shareToken = current.shareToken
  noteForm.images = [...current.images]
  noteTagsInput.value = current.tags.join(', ')
}

const resetForm = () => {
  noteForm.id = ''
  noteForm.title = ''
  noteForm.folder = store.noteFolders[0] || '默认灵感夹'
  noteForm.summary = ''
  noteForm.content = ''
  noteForm.starred = false
  noteForm.shareToken = ''
  noteForm.images = []
  noteTagsInput.value = ''
}

const saveFolderLibrary = () => {
  store.setNoteFolders(normalizeKeywordList(folderLibraryInput.value))
  folderLibraryInput.value = store.noteFolders.join(', ')

  toast.add({
    severity: 'success',
    summary: '文件夹库已更新',
    life: 2000,
  })
}

const saveTagLibrary = () => {
  store.setNoteTags(normalizeKeywordList(tagLibraryInput.value))
  tagLibraryInput.value = store.noteTags.join(', ')

  toast.add({
    severity: 'success',
    summary: '标签库已更新',
    life: 2000,
  })
}

const saveNote = () => {
  if (!noteForm.title.trim() && !noteForm.content.trim()) {
    toast.add({
      severity: 'warn',
      summary: '请先填写标题或正文',
      life: 2200,
    })
    return
  }

  const saved = store.upsertNote({
    id: noteForm.id || undefined,
    title: noteForm.title.trim() || '新的灵感笔记',
    folder: noteForm.folder.trim() || '默认灵感夹',
    summary: noteForm.summary.trim(),
    content: noteForm.content,
    starred: noteForm.starred,
    shareToken: noteForm.shareToken || undefined,
    tags: parsedTags.value,
    images: noteForm.images,
  })

  selectedNoteId.value = saved.id
  folderLibraryInput.value = store.noteFolders.join(', ')
  tagLibraryInput.value = store.noteTags.join(', ')
  loadNote(saved)

  toast.add({
    severity: 'success',
    summary: '灵感笔记已保存',
    life: 2200,
  })
}

const createFreshNote = () => {
  const created = store.upsertNote(store.createEmptyNote())
  loadNote(created)

  toast.add({
    severity: 'info',
    summary: '已创建新的空白笔记',
    life: 1800,
  })
}

const selectNote = (id: string) => {
  const target = store.notes.find((item) => item.id === id)
  if (!target) return
  loadNote(target)
}

const toggleStar = (id: string) => {
  store.toggleNoteStar(id)
  const target = store.notes.find((item) => item.id === id)
  if (target && selectedNoteId.value === id) {
    loadNote(target)
  }
}

const duplicate = (id?: string) => {
  if (!id) return
  const created = store.duplicateNote(id)
  if (!created) return
  loadNote(created)

  toast.add({
    severity: 'success',
    summary: '已生成笔记副本',
    life: 2000,
  })
}

const removeNote = (id: string) => {
  const target = store.notes.find((item) => item.id === id)
  store.removeNote(id)

  if (selectedNoteId.value === id) {
    const next = store.notes[0]
    if (next) {
      loadNote(next)
    } else {
      resetForm()
    }
  }

  toast.add({
    severity: 'success',
    summary: `已删除「${target?.title || '灵感笔记'}」`,
    life: 2000,
  })
}

const removeCurrentNote = () => {
  if (!noteForm.id) {
    resetForm()
    return
  }
  removeNote(noteForm.id)
}

const buildMarkdownForCurrent = () => {
  const title = noteForm.title.trim() || '新的灵感笔记'
  const tags = parsedTags.value.length ? parsedTags.value.map((item) => `#${item}`).join(' ') : ''
  const summary = noteForm.summary.trim() || markdownSummary(noteForm.content, 120)
  const imageBlocks = noteForm.images.map((item, index) => `![灵感图片 ${index + 1}](${item})`).join('\n\n')

  return `# ${title}

> 文件夹：${noteForm.folder || '默认灵感夹'}
> 分享标识：${noteForm.shareToken || '未生成'}
${tags ? `\n${tags}\n` : ''}

${summary ? `${summary}\n` : ''}

${noteForm.content || ''}

${imageBlocks ? `\n${imageBlocks}\n` : ''}`.trim()
}

const copyNote = async (note: InspirationNote) => {
  const tags = note.tags.length ? note.tags.map((item) => `#${item}`).join(' ') : ''
  const images = note.images.map((item, index) => `![灵感图片 ${index + 1}](${item})`).join('\n\n')
  const text = `# ${note.title}

> 文件夹：${note.folder}
> 分享标识：${note.shareToken}
${tags ? `\n${tags}\n` : ''}

${note.content}

${images ? `\n${images}\n` : ''}`.trim()

  await copyText(text)
  toast.add({
    severity: 'success',
    summary: '笔记内容已复制',
    life: 2000,
  })
}

const copyCurrentNote = async () => {
  await copyText(buildMarkdownForCurrent())
  toast.add({
    severity: 'success',
    summary: '当前笔记已复制',
    life: 2000,
  })
}

const openShareCard = (id?: string) => {
  if (!id) return
  shareTargetId.value = id
  shareCardVisible.value = true
}

const copyShareText = async () => {
  await copyText(shareText.value)
  toast.add({
    severity: 'success',
    summary: '分享文案已复制',
    life: 2000,
  })
}

const triggerImageInput = () => {
  imageInputRef.value?.click()
}

const handleImageChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const images = await readFilesAsDataUrls(input.files)
  noteForm.images = [...noteForm.images, ...images]
  input.value = ''
}

const removeImage = (index: number) => {
  noteForm.images = noteForm.images.filter((_, currentIndex) => currentIndex !== index)
}

watch(
  () => filteredNotes.value,
  (list) => {
    if (!list.length) return
    if (selectedNoteId.value && list.some((item) => item.id === selectedNoteId.value)) return
    if (!selectedNoteId.value) return
    loadNote(list[0])
  },
  { immediate: true },
)

watch(
  () => store.noteFolders,
  () => {
    folderLibraryInput.value = store.noteFolders.join(', ')
  },
  { deep: true },
)

watch(
  () => store.noteTags,
  () => {
    tagLibraryInput.value = store.noteTags.join(', ')
  },
  { deep: true },
)

watch(
  () => noteForm.id,
  (value) => {
    if (!value) {
      shareTargetId.value = ''
      return
    }
    if (!shareTargetId.value) {
      shareTargetId.value = value
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.note-page-grid {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 18px;
  align-items: start;
}

.left-column,
.center-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.folder-panel,
.library-panel,
.list-panel,
.editor-panel,
.assets-panel,
.share-preview,
.share-modal {
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

.section-actions,
.editor-actions,
.badge-stack,
.quick-actions,
.card-tags,
.share-actions,
.share-tags,
.folder-list,
.chip-group,
.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar-grid,
.form-grid {
  display: grid;
  gap: 14px;
  width: 100%;
}

.toolbar-grid {
  grid-template-columns: minmax(0, 1.6fr) repeat(2, minmax(0, 0.74fr));
}

.form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 16px;
}

.span-2 {
  grid-column: span 2;
}

.mt-16 {
  margin-top: 16px;
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

.toolbar-field span {
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
  min-height: 118px;
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
.tag-chip-btn,
.folder-item,
.star-btn,
.mini-icon-btn {
  transition: all 0.2s ease;
}

.page-btn,
.mini-btn {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 700;
  font-size: 13px;
}

.page-btn:hover,
.mini-btn:hover,
.tag-chip-btn:hover,
.folder-item:hover,
.note-card:hover,
.mini-icon-btn:hover,
.star-btn:hover {
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
.folder-item,
.tag-chip-btn,
.note-card,
.mini-icon-btn,
.toggle-pill {
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

.count-chip,
.tiny-badge,
.card-tag,
.share-tag,
.tag-chip-btn {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.count-chip,
.card-tag,
.share-tag,
.tag-chip-btn {
  background: var(--color-tag);
  border: 1px solid var(--color-border);
  color: var(--color-pill-text);
}

.folder-list {
  margin-top: 16px;
  flex-direction: column;
  align-items: stretch;
}

.folder-item {
  width: 100%;
  min-height: 74px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
  padding: 14px 16px;
}

.folder-item.active {
  border-color: var(--color-primary-border);
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.92), rgba(255, 255, 255, 0.76));
}

.folder-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.folder-main strong {
  font-size: 15px;
  color: var(--color-text-main);
}

.folder-main span,
.folder-item em {
  font-size: 12px;
  color: var(--color-text-muted);
  font-style: normal;
}

.chip-group {
  margin-top: 16px;
}

.tag-chip-btn {
  min-height: 34px;
}

.note-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.note-card {
  position: relative;
  text-align: left;
  padding: 16px;
  border-radius: 20px;
  overflow: hidden;
}

.note-card::after {
  content: '';
  position: absolute;
  right: -24px;
  bottom: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.08);
  pointer-events: none;
}

.note-card.active,
.note-card.starred {
  border-color: var(--color-primary-border);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}

.note-card-top,
.note-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.tiny-badge.folder {
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-border);
  color: var(--color-primary-text);
}

.tiny-badge.starred {
  background: rgba(254, 249, 195, 0.8);
  border: 1px solid rgba(253, 230, 138, 0.8);
  color: #ca8a04;
}

.star-btn {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.78);
  color: var(--color-text-muted);
  font-size: 18px;
}

.star-btn.active {
  color: #f59e0b;
  border-color: rgba(253, 230, 138, 0.8);
  background: rgba(254, 249, 195, 0.7);
}

.note-card h4 {
  margin: 14px 0 8px;
  font-size: 17px;
  line-height: 1.45;
  color: var(--color-text-main);
}

.note-card p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.8;
  min-height: 68px;
}

.card-tags {
  margin-top: 14px;
}

.code-preview {
  margin-top: 14px;
  border-radius: 16px;
  background: #0f172a;
  color: #dbeafe;
  padding: 12px 14px;
  overflow: hidden;
}

.code-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.65;
  font-size: 12px;
  font-family:
    'SFMono-Regular',
    'SF Mono',
    Consolas,
    'Liberation Mono',
    Menlo,
    monospace;
}

.note-card-foot {
  margin-top: 14px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.quick-actions {
  margin-top: 14px;
  justify-content: flex-start;
}

.mini-icon-btn {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.toggle-row {
  margin-top: 18px;
}

.toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-pill-text);
}

.toggle-pill input {
  width: 16px;
  height: 16px;
  accent-color: #0ea5e9;
}

.share-token {
  margin-left: auto;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.68);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.share-token span {
  font-size: 12px;
  color: var(--color-text-muted);
}

.share-token strong {
  font-size: 12px;
  color: var(--color-text-main);
}

.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
}

.hidden-input {
  display: none;
}

.image-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.image-card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.8);
  aspect-ratio: 1 / 1;
}

.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.55);
  color: #fff;
  font-size: 16px;
}

.share-card-demo,
.share-card-large {
  margin-top: 16px;
  border-radius: 24px;
  padding: 20px;
  border: 1px solid rgba(125, 211, 252, 0.28);
  background:
    linear-gradient(135deg, rgba(224, 242, 254, 0.95), rgba(255, 255, 255, 0.82)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.22), transparent 32%);
}

.share-card-header,
.share-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.share-mark {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.12);
  color: var(--color-primary-text);
  border: 1px solid rgba(14, 165, 233, 0.18);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.share-card-demo h4,
.share-card-large h4 {
  margin: 16px 0 10px;
  font-size: 24px;
  line-height: 1.35;
  color: var(--color-text-main);
}

.share-card-demo p,
.share-card-large p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.85;
}

.share-tags {
  margin-top: 16px;
}

.share-foot {
  margin-top: 18px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.share-copy {
  margin-top: 18px;
  border-radius: 18px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--color-border);
}

.share-copy pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-text-main);
  line-height: 1.8;
  font-size: 13px;
}

.mt-18 {
  margin-top: 18px;
}

.share-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(15, 23, 42, 0.38);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.share-modal {
  width: min(860px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
}

.empty-inline,
.empty-state {
  color: var(--color-text-muted);
  font-size: 13px;
}

.empty-state {
  min-height: 240px;
  grid-column: 1 / -1;
  border: 1px dashed var(--color-border);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
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

@media (max-width: 1480px) {
  .note-page-grid {
    grid-template-columns: 280px minmax(0, 1fr);
  }

  .right-column {
    grid-column: 1 / -1;
  }
}

@media (max-width: 1080px) {
  .note-page-grid,
  .toolbar-grid,
  .form-grid,
  .note-grid,
  .bottom-grid,
  .image-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }

  .share-token {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .folder-panel,
  .library-panel,
  .list-panel,
  .editor-panel,
  .assets-panel,
  .share-preview,
  .share-modal {
    padding: 14px;
  }

  .section-head {
    flex-direction: column;
  }

  .page-btn,
  .mini-btn {
    width: 100%;
  }

  .share-modal-mask {
    padding: 14px;
  }
}
</style>

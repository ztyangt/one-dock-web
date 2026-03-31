<template>
  <LedgerShell
    eyebrow="LIFE LEDGER / BLOG"
    title="博客文章"
    description="支持 Markdown 编辑、图片与链接插入、公开 / 私密权限、分类标签管理、搜索筛选、阅读统计、评论开关、草稿自动保存与博客主页分享。"
    :meta-list="[
      `${store.publicArticles.length} 篇公开发布`,
      `${store.articles.filter((item) => item.status === 'draft').length} 篇草稿`,
      `${store.totalArticleViews} 次阅读`,
    ]"
  >
    <template #actions>
      <button type="button" class="page-btn ghost" @click="openBlogHome">查看博客主页</button>
      <button type="button" class="page-btn ghost" @click="copyHomeLink">复制主页链接</button>
      <button type="button" class="page-btn primary" @click="handleCreateArticle">新建文章</button>
    </template>

    <template #stats>
      <MetricCard
        label="公开文章"
        :value="store.publicArticles.length"
        description="仅公开且已发布的文章会出现在对外博客主页"
        icon="📰"
        trend="博客主页已启用"
        trend-tone="primary"
      />
      <MetricCard
        label="草稿数量"
        :value="draftCount"
        description="草稿会在编辑过程中自动保存"
        icon="📝"
        :trend="lastAutosaveText"
        trend-tone="warning"
      />
      <MetricCard
        label="总阅读量"
        :value="store.totalArticleViews"
        description="在对外文章详情页访问时自动累加"
        icon="👀"
        trend="实时累计"
        trend-tone="success"
      />
      <MetricCard
        label="评论开启"
        :value="commentEnabledCount"
        description="支持针对单篇文章独立控制评论开关"
        icon="💬"
        trend="按篇配置"
        trend-tone="primary"
      />
    </template>

    <template #toolbar>
      <div class="toolbar-grid">
        <label class="toolbar-field grow">
          <span>搜索文章</span>
          <input
            v-model.trim="keyword"
            class="shell-input"
            type="text"
            placeholder="搜索标题、摘要、分类、标签或正文关键字"
          />
        </label>

        <label class="toolbar-field">
          <span>访问权限</span>
          <select v-model="accessFilter" class="shell-select">
            <option value="all">全部</option>
            <option value="public">公开</option>
            <option value="private">私密</option>
          </select>
        </label>

        <label class="toolbar-field">
          <span>发布状态</span>
          <select v-model="statusFilter" class="shell-select">
            <option value="all">全部</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
        </label>

        <label class="toolbar-field">
          <span>文章分类</span>
          <select v-model="categoryFilter" class="shell-select">
            <option value="all">全部</option>
            <option v-for="item in store.articleCategories" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>
      </div>
    </template>

    <section class="blog-page-grid">
      <aside class="left-column">
        <article class="blog-profile glass-panel">
          <div class="section-head">
            <div>
              <h3>博客主页设置</h3>
              <p>对外展示个人博客主页信息，并维护分类、标签基础库。</p>
            </div>
            <button type="button" class="mini-btn" @click="saveBlogProfile">保存设置</button>
          </div>

          <div class="profile-form">
            <label class="toolbar-field">
              <span>博客标题</span>
              <input v-model.trim="blogProfileForm.title" class="shell-input" type="text" />
            </label>

            <label class="toolbar-field">
              <span>博客副标题</span>
              <input v-model.trim="blogProfileForm.subtitle" class="shell-input" type="text" />
            </label>

            <label class="toolbar-field">
              <span>博客简介</span>
              <textarea
                v-model.trim="blogProfileForm.intro"
                class="shell-textarea small"
                placeholder="输入对外展示的博客介绍"
              />
            </label>

            <label class="toolbar-field">
              <span>分类库（逗号分隔）</span>
              <textarea
                v-model="categoryLibraryInput"
                class="shell-textarea tiny"
                placeholder="例如：城市观察, 个人成长, 生活计划"
              />
            </label>

            <label class="toolbar-field">
              <span>标签库（逗号分隔）</span>
              <textarea
                v-model="tagLibraryInput"
                class="shell-textarea tiny"
                placeholder="例如：散步, 写作, 旅行, 灵感"
              />
            </label>

            <div class="chip-group">
              <span
                v-for="item in store.articleCategories"
                :key="item"
                class="inline-chip"
              >
                # {{ item }}
              </span>
            </div>
          </div>
        </article>

        <article class="article-list glass-panel">
          <div class="section-head">
            <div>
              <h3>文章列表</h3>
              <p>点击文章卡片切换编辑，支持搜索、分类和权限筛选。</p>
            </div>
            <span class="count-chip">{{ filteredArticles.length }} 篇</span>
          </div>

          <div class="list-scroll">
            <button
              v-for="item in filteredArticles"
              :key="item.id"
              type="button"
              class="article-card"
              :class="{ active: item.id === selectedArticleId }"
              @click="selectArticle(item.id)"
            >
              <div class="article-card-head">
                <div class="status-stack">
                  <span class="tiny-badge" :class="item.access">
                    {{ item.access === 'public' ? '公开' : '私密' }}
                  </span>
                  <span class="tiny-badge" :class="item.status">
                    {{ item.status === 'published' ? '已发布' : '草稿' }}
                  </span>
                </div>
                <span class="date-text">{{ formatDate(item.updatedAt) }}</span>
              </div>

              <h4>{{ item.title }}</h4>
              <p>{{ item.summary || markdownSummary(item.content, 66) }}</p>

              <div class="card-tags">
                <span class="card-meta">{{ item.category }}</span>
                <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="card-meta muted">
                  {{ tag }}
                </span>
              </div>

              <div class="article-card-foot">
                <span>👀 {{ item.views }}</span>
                <span>💬 {{ item.comments.length }}</span>
                <span>{{ item.allowComments ? '评论开启' : '评论关闭' }}</span>
              </div>
            </button>

            <div v-if="!filteredArticles.length" class="empty-state">
              <div class="empty-icon">⌘</div>
              <p>当前筛选条件下没有文章，试试新建一篇新的博客内容。</p>
            </div>
          </div>
        </article>
      </aside>

      <section class="editor-column">
        <div class="editor-header glass-panel">
          <div class="section-head">
            <div>
              <h3>文章编辑器</h3>
              <p>支持 Markdown、封面、链接分享、评论开关和草稿自动保存。</p>
            </div>

            <div class="editor-actions">
              <button type="button" class="mini-btn" @click="saveArticle">
                保存文章
              </button>
              <button type="button" class="mini-btn ghost" @click="copyArticleLink">
                复制分享链接
              </button>
              <button type="button" class="mini-btn danger" @click="removeCurrentArticle">
                删除文章
              </button>
            </div>
          </div>

          <div class="form-grid">
            <label class="toolbar-field span-2">
              <span>文章标题</span>
              <input
                v-model.trim="articleForm.title"
                class="shell-input"
                type="text"
                placeholder="请输入文章标题"
              />
            </label>

            <label class="toolbar-field">
              <span>文章分类</span>
              <input
                v-model.trim="articleForm.category"
                class="shell-input"
                list="blog-category-list"
                type="text"
                placeholder="输入或选择分类"
              />
            </label>

            <label class="toolbar-field">
              <span>封面图片</span>
              <input
                v-model.trim="articleForm.cover"
                class="shell-input"
                type="text"
                placeholder="可直接粘贴图片地址"
              />
            </label>

            <label class="toolbar-field span-2">
              <span>文章摘要</span>
              <textarea
                v-model.trim="articleForm.summary"
                class="shell-textarea tiny"
                placeholder="可留空，保存时会自动从 Markdown 内容生成摘要"
              />
            </label>

            <label class="toolbar-field span-2">
              <span>标签管理（逗号分隔）</span>
              <textarea
                v-model="articleTagsInput"
                class="shell-textarea tiny"
                placeholder="例如：散步, 春天, 城市, 生活"
              />
            </label>
          </div>

          <div class="switch-row">
            <div class="switch-group">
              <span class="switch-label">发布权限</span>
              <div class="option-group">
                <button
                  type="button"
                  class="option-btn"
                  :class="{ active: articleForm.access === 'public' }"
                  @click="articleForm.access = 'public'"
                >
                  公开
                </button>
                <button
                  type="button"
                  class="option-btn"
                  :class="{ active: articleForm.access === 'private' }"
                  @click="articleForm.access = 'private'"
                >
                  私密
                </button>
              </div>
            </div>

            <div class="switch-group">
              <span class="switch-label">发布状态</span>
              <div class="option-group">
                <button
                  type="button"
                  class="option-btn"
                  :class="{ active: articleForm.status === 'draft' }"
                  @click="articleForm.status = 'draft'"
                >
                  草稿
                </button>
                <button
                  type="button"
                  class="option-btn"
                  :class="{ active: articleForm.status === 'published' }"
                  @click="articleForm.status = 'published'"
                >
                  发布
                </button>
              </div>
            </div>

            <label class="toggle-pill">
              <input v-model="articleForm.allowComments" type="checkbox" />
              <span>允许评论</span>
            </label>

            <div class="autosave-text">
              <span>Slug：{{ articleSlugPreview }}</span>
              <span>{{ lastAutosaveText }}</span>
            </div>
          </div>

          <datalist id="blog-category-list">
            <option v-for="item in store.articleCategories" :key="item" :value="item" />
          </datalist>
        </div>

        <MarkdownWorkbench
          v-model="articleForm.content"
          title="文章内容"
          description="支持图片上传、图片 URL、链接、清单、代码块、引用、标题和实时预览。"
          helper-text="草稿状态下将自动保存，发布状态下建议手动点击保存文章。"
          :min-height="480"
        />

        <div class="bottom-grid">
          <article class="share-panel glass-panel">
            <div class="section-head">
              <div>
                <h3>分享与发布</h3>
                <p>对外展示使用个人博客主页与文章详情链接。</p>
              </div>
            </div>

            <div class="share-list">
              <div class="share-item">
                <span class="share-label">博客主页</span>
                <div class="share-value">{{ homeLink }}</div>
              </div>
              <div class="share-item">
                <span class="share-label">文章详情</span>
                <div class="share-value">{{ articleShareLink }}</div>
              </div>
              <div class="share-actions">
                <button type="button" class="mini-btn" @click="copyHomeLink">复制主页链接</button>
                <button type="button" class="mini-btn ghost" @click="copyArticleLink">复制文章链接</button>
                <button type="button" class="mini-btn ghost" @click="openBlogHome">打开主页</button>
              </div>
            </div>
          </article>

          <article class="preview-card glass-panel">
            <div class="section-head">
              <div>
                <h3>博客卡片预览</h3>
                <p>用于预览对外博客主页中的文章卡片效果。</p>
              </div>
            </div>

            <div class="blog-card-demo">
              <img :src="articleCoverPreview" alt="cover" class="card-cover" />
              <div class="demo-body">
                <div class="demo-pills">
                  <span class="tiny-badge" :class="articleForm.access">
                    {{ articleForm.access === 'public' ? '公开' : '私密' }}
                  </span>
                  <span class="tiny-badge" :class="articleForm.status">
                    {{ articleForm.status === 'published' ? '已发布' : '草稿' }}
                  </span>
                </div>
                <h4>{{ articleForm.title || '未命名文章' }}</h4>
                <p>{{ articleSummaryPreview }}</p>
                <div class="demo-tags">
                  <span class="demo-tag">{{ articleForm.category || '未分类' }}</span>
                  <span
                    v-for="tag in parsedArticleTags.slice(0, 3)"
                    :key="tag"
                    class="demo-tag muted"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  </LedgerShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import LedgerShell from '../components/LedgerShell.vue'
import MetricCard from '../components/MetricCard.vue'
import MarkdownWorkbench from '../components/MarkdownWorkbench.vue'
import { useLifeLedgerStore } from '@/stores/life-ledger'
import type { BlogArticle } from '@/types/life-ledger'
import {
  buildShareUrl,
  copyText,
  createSvgCover,
  formatDate,
  formatDateTime,
  markdownSummary,
  normalizeKeywordList,
  slugify,
} from '@/utils/life-ledger'

type ArticleForm = {
  id: string
  title: string
  summary: string
  content: string
  cover: string
  category: string
  access: 'public' | 'private'
  status: 'draft' | 'published'
  allowComments: boolean
}

const router = useRouter()
const toast = useToast()
const store = useLifeLedgerStore()

const keyword = ref('')
const accessFilter = ref<'all' | 'public' | 'private'>('all')
const statusFilter = ref<'all' | 'draft' | 'published'>('all')
const categoryFilter = ref('all')
const selectedArticleId = ref(store.articles[0]?.id || '')
const autoSaveTimer = ref<number>()
const lastAutosaveAt = ref('')
const categoryLibraryInput = ref(store.articleCategories.join(', '))
const tagLibraryInput = ref(store.articleTags.join(', '))
const articleTagsInput = ref('')

const blogProfileForm = reactive({
  title: store.blogProfile.title,
  subtitle: store.blogProfile.subtitle,
  intro: store.blogProfile.intro,
})

const articleForm = reactive<ArticleForm>({
  id: '',
  title: '',
  summary: '',
  content: '',
  cover: '',
  category: '',
  access: 'private',
  status: 'draft',
  allowComments: true,
})

const draftCount = computed(() => store.articles.filter((item) => item.status === 'draft').length)
const commentEnabledCount = computed(
  () => store.articles.filter((item) => item.allowComments).length,
)

const parsedArticleTags = computed(() => normalizeKeywordList(articleTagsInput.value))

const filteredArticles = computed(() => {
  const search = keyword.value.trim().toLowerCase()

  return [...store.articles]
    .filter((item) => {
      if (accessFilter.value !== 'all' && item.access !== accessFilter.value) return false
      if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
      if (categoryFilter.value !== 'all' && item.category !== categoryFilter.value) return false

      if (!search) return true

      const matchSource = [
        item.title,
        item.summary,
        item.category,
        item.tags.join(' '),
        item.content,
      ]
        .join(' ')
        .toLowerCase()

      return matchSource.includes(search)
    })
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
})

const articleSlugPreview = computed(() => {
  if (!articleForm.title.trim()) return 'post-draft'
  return store.resolveUniqueSlug(articleForm.title.trim(), articleForm.id)
})

const articleShareLink = computed(() => buildShareUrl(`/blog/${articleSlugPreview.value}`))
const homeLink = computed(() => buildShareUrl('/blog'))

const articleCoverPreview = computed(
  () => articleForm.cover || createSvgCover(articleForm.title || '博客文章', '#38bdf8', '#818cf8'),
)

const articleSummaryPreview = computed(
  () =>
    articleForm.summary.trim() ||
    markdownSummary(articleForm.content || articleForm.title || '开始写一篇新的博客文章吧。', 88),
)

const lastAutosaveText = computed(() => {
  if (!lastAutosaveAt.value) return '尚未自动保存'
  return `自动保存于 ${formatDateTime(lastAutosaveAt.value)}`
})

const loadArticleIntoForm = (article?: BlogArticle) => {
  const current =
    article ||
    store.articles.find((item) => item.id === selectedArticleId.value) ||
    store.createEmptyArticle()

  selectedArticleId.value = current.id
  articleForm.id = current.id
  articleForm.title = current.title
  articleForm.summary = current.summary
  articleForm.content = current.content
  articleForm.cover = current.cover
  articleForm.category = current.category
  articleForm.access = current.access
  articleForm.status = current.status
  articleForm.allowComments = current.allowComments
  articleTagsInput.value = current.tags.join(', ')
  lastAutosaveAt.value = current.lastAutoSavedAt || ''
}

const saveBlogProfile = () => {
  store.updateBlogProfile({
    title: blogProfileForm.title.trim() || store.blogProfile.title,
    subtitle: blogProfileForm.subtitle.trim(),
    intro: blogProfileForm.intro.trim(),
  })
  store.setArticleCategories(normalizeKeywordList(categoryLibraryInput.value))
  store.setArticleTags(normalizeKeywordList(tagLibraryInput.value))

  toast.add({
    severity: 'success',
    summary: '博客主页设置已保存',
    life: 2200,
  })
}

const saveArticle = () => {
  if (!articleForm.title.trim()) {
    toast.add({
      severity: 'warn',
      summary: '请先填写文章标题',
      life: 2200,
    })
    return
  }

  const saved = store.upsertArticle({
    id: articleForm.id || undefined,
    title: articleForm.title.trim(),
    summary: articleForm.summary.trim(),
    content: articleForm.content,
    cover:
      articleForm.cover.trim() ||
      createSvgCover(articleForm.title.trim() || '博客文章', '#38bdf8', '#818cf8'),
    category: articleForm.category.trim() || '未分类',
    tags: parsedArticleTags.value,
    access: articleForm.access,
    status: articleForm.status,
    allowComments: articleForm.allowComments,
  })

  categoryLibraryInput.value = store.articleCategories.join(', ')
  tagLibraryInput.value = store.articleTags.join(', ')
  loadArticleIntoForm(saved)

  toast.add({
    severity: 'success',
    summary: articleForm.status === 'published' ? '文章已发布' : '文章已保存',
    life: 2200,
  })
}

const selectArticle = (id: string) => {
  const target = store.articles.find((item) => item.id === id)
  if (!target) return
  loadArticleIntoForm(target)
}

const handleCreateArticle = () => {
  const draft = store.createEmptyArticle()
  draft.title = '新的博客文章'
  draft.cover = createSvgCover('新的博客文章', '#22c55e', '#38bdf8')
  const saved = store.upsertArticle(draft)
  loadArticleIntoForm(saved)

  toast.add({
    severity: 'info',
    summary: '已创建新的文章草稿',
    life: 1800,
  })
}

const removeCurrentArticle = () => {
  if (!articleForm.id) return

  const title = articleForm.title || '当前文章'
  store.removeArticle(articleForm.id)

  const next = store.articles[0]
  if (next) {
    loadArticleIntoForm(next)
  } else {
    const fresh = store.upsertArticle(store.createEmptyArticle())
    loadArticleIntoForm(fresh)
  }

  toast.add({
    severity: 'success',
    summary: `已删除《${title}》`,
    life: 2200,
  })
}

const copyArticleLink = async () => {
  await copyText(articleShareLink.value)
  toast.add({
    severity: 'success',
    summary: '文章分享链接已复制',
    life: 2000,
  })
}

const copyHomeLink = async () => {
  await copyText(homeLink.value)
  toast.add({
    severity: 'success',
    summary: '博客主页链接已复制',
    life: 2000,
  })
}

const openBlogHome = () => {
  router.push('/blog')
}

watch(
  () => selectedArticleId.value,
  () => {
    const target = store.articles.find((item) => item.id === selectedArticleId.value)
    if (target) loadArticleIntoForm(target)
  },
  { immediate: true },
)

watch(
  () => [articleForm.title, articleForm.summary, articleForm.content, articleForm.cover, articleForm.category, articleForm.access, articleForm.status, articleForm.allowComments, articleTagsInput.value],
  () => {
    if (!articleForm.id || articleForm.status !== 'draft') return

    window.clearTimeout(autoSaveTimer.value)

    autoSaveTimer.value = window.setTimeout(() => {
      const saved = store.autosaveArticleDraft(articleForm.id, {
        id: articleForm.id,
        title: articleForm.title.trim() || '未命名文章',
        summary: articleForm.summary.trim(),
        content: articleForm.content,
        cover:
          articleForm.cover.trim() ||
          createSvgCover(articleForm.title.trim() || '博客文章', '#22c55e', '#38bdf8'),
        category: articleForm.category.trim() || '未分类',
        tags: parsedArticleTags.value,
        access: articleForm.access,
        allowComments: articleForm.allowComments,
      })

      if (saved) {
        lastAutosaveAt.value = saved.lastAutoSavedAt || saved.updatedAt
      }
    }, 1200)
  },
  { deep: true },
)

watch(
  () => filteredArticles.value,
  (list) => {
    if (!list.length) return
    if (!list.some((item) => item.id === selectedArticleId.value)) {
      loadArticleIntoForm(list[0])
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.blog-page-grid {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.left-column,
.editor-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.blog-profile,
.article-list,
.editor-header,
.share-panel,
.preview-card {
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
.profile-form,
.form-grid {
  display: grid;
  gap: 14px;
}

.toolbar-grid {
  grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 0.7fr));
  width: 100%;
}

.profile-form {
  margin-top: 16px;
}

.form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 18px;
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
.switch-label {
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
  line-height: 1.7;
}

.shell-textarea.small {
  min-height: 94px;
}

.shell-textarea.tiny {
  min-height: 86px;
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
.option-btn {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 700;
  font-size: 13px;
  transition: all 0.2s ease;
}

.page-btn:hover,
.mini-btn:hover,
.option-btn:hover {
  transform: translateY(-1px);
}

.page-btn.primary,
.mini-btn {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #fff;
  box-shadow: 0 14px 28px rgba(14, 165, 233, 0.22);
}

.page-btn.ghost,
.mini-btn.ghost,
.option-btn {
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-main);
  border-color: var(--color-border);
}

.mini-btn.danger {
  background: rgba(248, 113, 113, 0.12);
  color: #dc2626;
  border-color: rgba(248, 113, 113, 0.2);
  box-shadow: none;
}

.option-group {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.option-btn.active {
  color: var(--color-primary-text);
  border-color: var(--color-primary-border);
  background: var(--color-primary-bg);
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px dashed var(--color-border);
}

.switch-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.68);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-pill-text);
}

.toggle-pill input {
  width: 16px;
  height: 16px;
  accent-color: #0ea5e9;
}

.autosave-text {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.chip-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.inline-chip,
.count-chip,
.card-meta,
.demo-tag {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.inline-chip,
.count-chip,
.demo-tag {
  background: var(--color-tag);
  border: 1px solid var(--color-border);
  color: var(--color-pill-text);
}

.article-list {
  min-height: 520px;
  display: flex;
  flex-direction: column;
}

.list-scroll {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
  max-height: 920px;
  padding-right: 4px;
}

.article-card {
  width: 100%;
  text-align: left;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.62);
  transition: all 0.2s ease;
}

.article-card:hover,
.article-card.active {
  border-color: var(--color-primary-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(240, 249, 255, 0.92));
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.article-card-head,
.article-card-foot,
.card-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.article-card-head {
  justify-content: space-between;
}

.status-stack {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tiny-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.tiny-badge.public {
  color: #0f766e;
  background: rgba(45, 212, 191, 0.12);
  border: 1px solid rgba(45, 212, 191, 0.18);
}

.tiny-badge.private {
  color: #7c3aed;
  background: rgba(196, 181, 253, 0.18);
  border: 1px solid rgba(196, 181, 253, 0.22);
}

.tiny-badge.published {
  color: #0369a1;
  background: rgba(125, 211, 252, 0.18);
  border: 1px solid rgba(125, 211, 252, 0.2);
}

.tiny-badge.draft {
  color: #d97706;
  background: rgba(253, 230, 138, 0.24);
  border: 1px solid rgba(253, 230, 138, 0.28);
}

.date-text {
  font-size: 12px;
  color: var(--color-text-muted);
}

.article-card h4 {
  margin: 12px 0 8px;
  font-size: 16px;
  line-height: 1.45;
  color: var(--color-text-main);
}

.article-card p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.75;
}

.card-tags {
  margin-top: 12px;
}

.card-meta {
  background: var(--color-tag);
  color: var(--color-pill-text);
}

.card-meta.muted {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--color-border);
}

.article-card-foot {
  margin-top: 12px;
  justify-content: space-between;
  color: var(--color-text-muted);
  font-size: 12px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 18px;
}

.share-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.share-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.share-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-pill-text);
}

.share-value {
  min-height: 46px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  color: var(--color-text-muted);
  word-break: break-all;
}

.share-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.blog-card-demo {
  margin-top: 16px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.68);
}

.card-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.demo-body {
  padding: 18px;
}

.demo-pills,
.demo-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.demo-body h4 {
  margin: 12px 0 10px;
  font-size: 18px;
  line-height: 1.45;
  color: var(--color-text-main);
}

.demo-body p {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.8;
  font-size: 13px;
}

.demo-tags {
  margin-top: 14px;
}

.demo-tag.muted {
  background: rgba(255, 255, 255, 0.78);
}

.empty-state {
  min-height: 220px;
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

@media (max-width: 1280px) {
  .blog-page-grid {
    grid-template-columns: 1fr;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .list-scroll {
    max-height: 480px;
  }
}

@media (max-width: 980px) {
  .toolbar-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }

  .switch-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .autosave-text {
    margin-left: 0;
    min-width: 0;
  }
}

@media (max-width: 640px) {
  .blog-profile,
  .article-list,
  .editor-header,
  .share-panel,
  .preview-card {
    padding: 14px;
  }

  .section-head {
    flex-direction: column;
  }

  .editor-actions,
  .share-actions {
    width: 100%;
  }

  .page-btn,
  .mini-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

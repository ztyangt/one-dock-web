<template>
  <div class="blog-detail-page main-bg-style">
    <template v-if="article">
      <section class="detail-hero glass-panel">
        <button type="button" class="back-btn" @click="goBack">← 返回博客主页</button>

        <div class="hero-grid">
          <div class="hero-copy">
            <div class="hero-meta">
              <span class="meta-pill category">{{ article.category }}</span>
              <span class="meta-pill soft">{{ formatDate(article.publishedAt || article.updatedAt) }}</span>
              <span class="meta-pill soft">👀 {{ article.views }}</span>
              <span class="meta-pill soft">
                {{ article.allowComments ? `💬 ${article.comments.length}` : '评论已关闭' }}
              </span>
            </div>

            <h1>{{ article.title }}</h1>
            <p class="hero-summary">
              {{ article.summary || markdownSummary(article.content, 140) }}
            </p>

            <div class="hero-tags">
              <span v-for="tag in article.tags" :key="tag" class="tag-chip"># {{ tag }}</span>
            </div>

            <div class="hero-actions">
              <button type="button" class="hero-btn primary" @click="copyArticleLink">复制分享链接</button>
              <button type="button" class="hero-btn ghost" @click="goBack">继续浏览</button>
            </div>
          </div>

          <div class="hero-cover-wrap">
            <img :src="article.cover" :alt="article.title" class="hero-cover" />
          </div>
        </div>
      </section>

      <section class="detail-layout">
        <article class="article-panel glass-panel">
          <div class="article-content markdown-body" v-html="articleHtml"></div>
        </article>

        <aside class="side-panel">
          <article class="info-card glass-panel">
            <div class="card-head">
              <h3>文章信息</h3>
            </div>

            <div class="info-list">
              <div class="info-item">
                <span>发布时间</span>
                <strong>{{ formatDate(article.publishedAt || article.updatedAt) }}</strong>
              </div>
              <div class="info-item">
                <span>最近更新</span>
                <strong>{{ formatDateTime(article.updatedAt) }}</strong>
              </div>
              <div class="info-item">
                <span>所属分类</span>
                <strong>{{ article.category }}</strong>
              </div>
              <div class="info-item">
                <span>阅读量</span>
                <strong>{{ article.views }}</strong>
              </div>
              <div class="info-item">
                <span>评论状态</span>
                <strong>{{ article.allowComments ? '已开启' : '已关闭' }}</strong>
              </div>
            </div>
          </article>

          <article class="info-card glass-panel">
            <div class="card-head">
              <h3>相关文章</h3>
            </div>

            <div v-if="relatedArticles.length" class="related-list">
              <button
                v-for="item in relatedArticles"
                :key="item.id"
                type="button"
                class="related-item"
                @click="openArticle(item.slug)"
              >
                <strong>{{ item.title }}</strong>
                <span>{{ item.category }} · {{ formatDate(item.publishedAt || item.updatedAt) }}</span>
              </button>
            </div>

            <div v-else class="empty-inline">暂时没有更多相关文章，可以回到主页继续浏览。</div>
          </article>

          <article class="info-card glass-panel">
            <div class="card-head">
              <h3>标签索引</h3>
            </div>

            <div class="hero-tags compact">
              <span v-for="tag in article.tags" :key="tag" class="tag-chip"># {{ tag }}</span>
            </div>
          </article>
        </aside>
      </section>

      <section class="comment-section glass-panel">
        <div class="card-head">
          <div>
            <h3>评论区</h3>
            <p>如果文章开启评论，你可以在这里留下阅读感受。</p>
          </div>
        </div>

        <template v-if="article.allowComments">
          <form class="comment-form" @submit.prevent="submitComment">
            <div class="comment-grid">
              <label class="field">
                <span>你的昵称</span>
                <input
                  v-model.trim="commentAuthor"
                  class="field-input"
                  type="text"
                  maxlength="24"
                  placeholder="例如：访客 A"
                />
              </label>

              <label class="field span-2">
                <span>评论内容</span>
                <textarea
                  v-model.trim="commentContent"
                  class="field-textarea"
                  maxlength="300"
                  placeholder="写下你对这篇文章的想法..."
                />
              </label>
            </div>

            <div class="comment-actions">
              <span class="comment-tip">评论会保存在当前浏览器本地环境中。</span>
              <button type="submit" class="hero-btn primary">发布评论</button>
            </div>
          </form>

          <div v-if="article.comments.length" class="comment-list">
            <article
              v-for="comment in sortedComments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-top">
                <strong>{{ comment.author }}</strong>
                <span>{{ formatDateTime(comment.createdAt) }}</span>
              </div>
              <p>{{ comment.content }}</p>
            </article>
          </div>

          <div v-else class="empty-comment">
            <div class="empty-icon">💬</div>
            <p>还没有评论，欢迎成为第一个留言的人。</p>
          </div>
        </template>

        <template v-else>
          <div class="comment-closed">
            <div class="empty-icon">🔒</div>
            <p>这篇文章已关闭评论。</p>
          </div>
        </template>
      </section>
    </template>

    <section v-else class="not-found glass-panel">
      <div class="empty-icon">✦</div>
      <h2>未找到这篇文章</h2>
      <p>这篇文章可能尚未公开、已被移除，或分享链接已经失效。</p>
      <button type="button" class="hero-btn primary" @click="goBack">返回博客主页</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useLifeLedgerStore } from '@/stores/life-ledger'
import {
  buildShareUrl,
  copyText,
  formatDate,
  formatDateTime,
  markdownSummary,
  renderMarkdown,
} from '@/utils/life-ledger'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = useLifeLedgerStore()

const commentAuthor = ref('')
const commentContent = ref('')

const currentSlug = computed(() => String(route.params.slug || ''))

const article = computed(() =>
  store.publicArticles.find((item) => item.slug === currentSlug.value) || null,
)

const articleHtml = computed(() => renderMarkdown(article.value?.content || ''))

const relatedArticles = computed(() => {
  if (!article.value) return []

  return store.publicArticles
    .filter((item) => item.id !== article.value?.id)
    .filter(
      (item) =>
        item.category === article.value?.category ||
        item.tags.some((tag) => article.value?.tags.includes(tag)),
    )
    .slice(0, 4)
})

const sortedComments = computed(() =>
  [...(article.value?.comments || [])].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  ),
)

const trackView = (slug: string) => {
  if (!slug) return

  const key = `BLOG-VIEWED-${slug}`
  if (typeof sessionStorage !== 'undefined') {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  }

  store.incrementArticleViews(slug)
}

const goBack = () => {
  router.push('/blog')
}

const openArticle = (slug: string) => {
  router.push(`/blog/${slug}`)
}

const copyArticleLink = async () => {
  if (!article.value) return

  await copyText(buildShareUrl(`/blog/${article.value.slug}`))
  toast.add({
    severity: 'success',
    summary: '文章链接已复制',
    life: 2000,
  })
}

const submitComment = () => {
  if (!article.value || !article.value.allowComments) return

  if (!commentContent.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: '请先填写评论内容',
      life: 2200,
    })
    return
  }

  const comment = store.addArticleComment(article.value.id, {
    author: commentAuthor.value.trim() || '匿名访客',
    content: commentContent.value.trim(),
  })

  if (!comment) {
    toast.add({
      severity: 'warn',
      summary: '评论提交失败，请稍后重试',
      life: 2200,
    })
    return
  }

  commentAuthor.value = ''
  commentContent.value = ''

  toast.add({
    severity: 'success',
    summary: '评论已发布',
    life: 2000,
  })
}

watch(
  () => currentSlug.value,
  (slug) => {
    trackView(slug)
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.blog-detail-page {
  min-height: 100vh;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-hero,
.article-panel,
.info-card,
.comment-section,
.not-found {
  padding: 22px;
}

.back-btn {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-main);
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.back-btn:hover,
.hero-btn:hover,
.related-item:hover,
.text-btn:hover {
  transform: translateY(-1px);
}

.hero-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(340px, 440px);
  gap: 24px;
  align-items: center;
}

.hero-copy {
  min-width: 0;
}

.hero-meta,
.hero-tags,
.comment-actions,
.card-head,
.info-list,
.related-list,
.comment-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-meta {
  align-items: center;
}

.meta-pill,
.tag-chip {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.meta-pill.category {
  background: var(--color-primary-bg);
  color: var(--color-primary-text);
  border: 1px solid var(--color-primary-border);
}

.meta-pill.soft,
.tag-chip {
  background: var(--color-tag);
  color: var(--color-pill-text);
  border: 1px solid var(--color-border);
}

.hero-copy h1 {
  margin: 18px 0 0;
  font-size: clamp(30px, 4vw, 44px);
  line-height: 1.15;
  color: var(--color-text-main);
  letter-spacing: -0.03em;
}

.hero-summary {
  margin: 16px 0 0;
  color: var(--color-text-muted);
  font-size: 15px;
  line-height: 1.9;
}

.hero-tags {
  margin-top: 18px;
}

.hero-tags.compact {
  margin-top: 0;
}

.hero-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn,
.text-btn {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.hero-btn.primary {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #fff;
  box-shadow: 0 14px 28px rgba(14, 165, 233, 0.2);
}

.hero-btn.ghost,
.text-btn {
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-main);
  border-color: var(--color-border);
}

.hero-cover-wrap {
  border-radius: 26px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.78);
}

.hero-cover {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-content {
  color: var(--color-text-main);
  line-height: 1.9;
  font-size: 15px;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  margin: 1.3em 0 0.7em;
  line-height: 1.35;
  color: var(--color-text-main);
}

.markdown-body :deep(p) {
  margin: 0.9em 0;
}

.markdown-body :deep(a) {
  color: var(--color-primary-text);
  text-decoration: none;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.4em;
}

.markdown-body :deep(blockquote) {
  margin: 1.2em 0;
  padding: 12px 16px;
  border-left: 3px solid var(--color-primary-solid);
  background: var(--color-primary-bg);
  border-radius: 0 14px 14px 0;
  color: var(--color-text-muted);
}

.markdown-body :deep(code) {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--color-tag);
  font-size: 0.92em;
}

.markdown-body :deep(pre) {
  padding: 16px;
  border-radius: 16px;
  overflow: auto;
  background: #0f172a;
  color: #e2e8f0;
}

.markdown-body :deep(pre code) {
  padding: 0;
  background: transparent;
  color: inherit;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1.6em 0;
}

.card-head {
  align-items: flex-start;
  justify-content: space-between;
}

.card-head h3 {
  margin: 0;
  font-size: 18px;
  color: var(--color-text-main);
}

.card-head p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.75;
}

.info-list {
  margin-top: 16px;
  flex-direction: column;
}

.info-item {
  min-height: 52px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.68);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.info-item span {
  font-size: 12px;
  color: var(--color-text-muted);
}

.info-item strong {
  font-size: 13px;
  color: var(--color-text-main);
}

.related-list {
  margin-top: 16px;
  flex-direction: column;
}

.related-item {
  width: 100%;
  text-align: left;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.68);
  transition: all 0.2s ease;
}

.related-item strong {
  display: block;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-main);
}

.related-item span {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.comment-form {
  margin-top: 16px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.66);
}

.comment-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.field span {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-pill-text);
}

.field-input,
.field-textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-text-main);
  border-radius: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.field-input {
  min-height: 44px;
  padding: 0 14px;
}

.field-textarea {
  min-height: 120px;
  padding: 12px 14px;
  resize: vertical;
  line-height: 1.75;
}

.field-input:focus,
.field-textarea:focus {
  border-color: var(--color-primary-border);
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.08);
}

.span-2 {
  grid-column: span 2;
}

.comment-actions {
  margin-top: 16px;
  align-items: center;
  justify-content: space-between;
}

.comment-tip {
  font-size: 12px;
  color: var(--color-text-muted);
}

.comment-list {
  margin-top: 18px;
  flex-direction: column;
}

.comment-item {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.68);
}

.comment-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.comment-top strong {
  font-size: 14px;
  color: var(--color-text-main);
}

.comment-top span {
  font-size: 12px;
  color: var(--color-text-muted);
}

.comment-item p {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.85;
  color: var(--color-text-main);
}

.empty-inline,
.empty-comment,
.comment-closed,
.not-found {
  text-align: center;
}

.empty-inline {
  margin-top: 16px;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.8;
}

.empty-comment,
.comment-closed,
.not-found {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--color-primary-bg);
  color: var(--color-primary-text);
  font-size: 18px;
  font-weight: 700;
}

.not-found h2 {
  margin: 0;
  font-size: 26px;
  color: var(--color-text-main);
}

.not-found p {
  margin: 0;
  max-width: 520px;
  line-height: 1.85;
  color: var(--color-text-muted);
}

@media (max-width: 1180px) {
  .hero-grid,
  .detail-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .blog-detail-page {
    padding: 18px;
  }

  .comment-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }

  .comment-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .blog-detail-page {
    padding: 14px;
  }

  .detail-hero,
  .article-panel,
  .info-card,
  .comment-section,
  .not-found {
    padding: 16px;
  }

  .hero-actions,
  .comment-actions {
    width: 100%;
  }

  .hero-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

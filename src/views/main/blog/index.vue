<template>
  <div class="blog-home-page main-bg-style">
    <section class="blog-hero glass-panel">
      <div class="hero-copy">
        <div class="hero-badge">LIFE LEDGER · PUBLIC BLOG</div>
        <h1>{{ store.blogProfile.title }}</h1>
        <p class="hero-subtitle">{{ store.blogProfile.subtitle }}</p>
        <p class="hero-intro">{{ store.blogProfile.intro }}</p>

        <div class="hero-meta">
          <div class="meta-card">
            <strong>{{ publicArticles.length }}</strong>
            <span>公开文章</span>
          </div>
          <div class="meta-card">
            <strong>{{ store.totalArticleViews }}</strong>
            <span>累计阅读</span>
          </div>
          <div class="meta-card">
            <strong>{{ categories.length }}</strong>
            <span>内容分类</span>
          </div>
        </div>

        <div class="hero-actions">
          <button type="button" class="hero-btn primary" @click="scrollToArticles">开始阅读</button>
          <button type="button" class="hero-btn ghost" @click="copyHomeLink">复制主页链接</button>
        </div>
      </div>

      <div class="hero-feature" v-if="featuredArticle">
        <div class="feature-cover-wrap">
          <img :src="featuredArticle.cover" :alt="featuredArticle.title" class="feature-cover" />
        </div>

        <div class="feature-body">
          <div class="feature-top">
            <span class="feature-pill">{{ featuredArticle.category }}</span>
            <span class="feature-date">{{ formatDate(featuredArticle.publishedAt || featuredArticle.updatedAt) }}</span>
          </div>

          <h2>{{ featuredArticle.title }}</h2>
          <p>{{ featuredArticle.summary || markdownSummary(featuredArticle.content, 110) }}</p>

          <div class="feature-tags">
            <span v-for="tag in featuredArticle.tags.slice(0, 4)" :key="tag" class="tag-chip"># {{ tag }}</span>
          </div>

          <button type="button" class="read-btn" @click="openArticle(featuredArticle.slug)">
            阅读精选文章
          </button>
        </div>
      </div>
    </section>

    <section class="blog-filter glass-panel" ref="articleSectionRef">
      <div class="filter-grid">
        <label class="filter-field grow">
          <span>搜索文章</span>
          <input
            v-model.trim="keyword"
            class="filter-input"
            type="text"
            placeholder="搜索标题、摘要、正文、分类或标签"
          />
        </label>

        <label class="filter-field">
          <span>分类筛选</span>
          <select v-model="categoryFilter" class="filter-select">
            <option value="all">全部分类</option>
            <option v-for="item in categories" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label class="filter-field">
          <span>标签筛选</span>
          <select v-model="tagFilter" class="filter-select">
            <option value="all">全部标签</option>
            <option v-for="item in tags" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>
      </div>

      <div class="quick-tags">
        <button
          type="button"
          class="quick-tag"
          :class="{ active: tagFilter === 'all' }"
          @click="tagFilter = 'all'"
        >
          全部
        </button>
        <button
          v-for="item in tags.slice(0, 10)"
          :key="item"
          type="button"
          class="quick-tag"
          :class="{ active: tagFilter === item }"
          @click="tagFilter = item"
        >
          # {{ item }}
        </button>
      </div>
    </section>

    <section class="blog-list-section">
      <div class="section-head">
        <div>
          <h3>博客文章</h3>
          <p>记录那些值得被认真保存的文字、片段、观察与生活灵感。</p>
        </div>
        <span class="section-count">{{ filteredArticles.length }} 篇文章</span>
      </div>

      <div v-if="filteredArticles.length" class="article-grid">
        <article
          v-for="article in filteredArticles"
          :key="article.id"
          class="article-card glass-panel"
        >
          <button type="button" class="card-cover-wrap" @click="openArticle(article.slug)">
            <img :src="article.cover" :alt="article.title" class="card-cover" />
          </button>

          <div class="card-body">
            <div class="card-meta">
              <span class="meta-pill category">{{ article.category }}</span>
              <span class="meta-text">{{ formatDate(article.publishedAt || article.updatedAt) }}</span>
            </div>

            <h4>{{ article.title }}</h4>
            <p>{{ article.summary || markdownSummary(article.content, 96) }}</p>

            <div class="card-tags">
              <span v-for="tag in article.tags.slice(0, 4)" :key="tag" class="tag-chip muted">
                # {{ tag }}
              </span>
            </div>

            <div class="card-footer">
              <div class="footer-meta">
                <span>👀 {{ article.views }}</span>
                <span>💬 {{ article.allowComments ? article.comments.length : '关闭' }}</span>
              </div>

              <div class="footer-actions">
                <button type="button" class="text-btn" @click="copyArticleLink(article.slug)">分享</button>
                <button type="button" class="text-btn primary" @click="openArticle(article.slug)">阅读</button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty-state glass-panel">
        <div class="empty-icon">✦</div>
        <h4>没有找到匹配的文章</h4>
        <p>试试更换关键词、分类或标签，也可以回到全部文章重新浏览。</p>
        <button type="button" class="hero-btn ghost" @click="resetFilters">查看全部</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useLifeLedgerStore } from '@/stores/life-ledger'
import { buildShareUrl, copyText, formatDate, markdownSummary } from '@/utils/life-ledger'

const router = useRouter()
const toast = useToast()
const store = useLifeLedgerStore()

const keyword = ref('')
const categoryFilter = ref('all')
const tagFilter = ref('all')
const articleSectionRef = ref<HTMLElement | null>(null)

const publicArticles = computed(() => store.publicArticles)
const featuredArticle = computed(() => publicArticles.value[0] || null)

const categories = computed(() =>
  [...new Set(publicArticles.value.map((item) => item.category).filter(Boolean))],
)

const tags = computed(() =>
  [...new Set(publicArticles.value.flatMap((item) => item.tags).filter(Boolean))],
)

const filteredArticles = computed(() => {
  const search = keyword.value.trim().toLowerCase()

  return publicArticles.value.filter((item) => {
    if (categoryFilter.value !== 'all' && item.category !== categoryFilter.value) return false
    if (tagFilter.value !== 'all' && !item.tags.includes(tagFilter.value)) return false

    if (!search) return true

    return [item.title, item.summary, item.content, item.category, item.tags.join(' ')]
      .join(' ')
      .toLowerCase()
      .includes(search)
  })
})

const openArticle = (slug: string) => {
  router.push(`/blog/${slug}`)
}

const copyArticleLink = async (slug: string) => {
  await copyText(buildShareUrl(`/blog/${slug}`))
  toast.add({
    severity: 'success',
    summary: '文章链接已复制',
    life: 2000,
  })
}

const copyHomeLink = async () => {
  await copyText(buildShareUrl('/blog'))
  toast.add({
    severity: 'success',
    summary: '博客主页链接已复制',
    life: 2000,
  })
}

const scrollToArticles = () => {
  articleSectionRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const resetFilters = () => {
  keyword.value = ''
  categoryFilter.value = 'all'
  tagFilter.value = 'all'
}
</script>

<style scoped lang="scss">
.blog-home-page {
  min-height: 100vh;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.blog-hero {
  padding: 28px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, 520px);
  gap: 24px;
  align-items: center;
}

.hero-copy {
  min-width: 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-border);
  color: var(--color-primary-text);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-copy h1 {
  margin: 18px 0 0;
  font-size: clamp(34px, 5vw, 54px);
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, var(--color-headline-start), var(--color-headline-end));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-subtitle {
  margin: 14px 0 0;
  font-size: 18px;
  line-height: 1.7;
  color: var(--color-pill-text);
  font-weight: 600;
}

.hero-intro {
  margin: 14px 0 0;
  max-width: 760px;
  font-size: 15px;
  line-height: 1.9;
  color: var(--color-text-muted);
}

.hero-meta {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.meta-card {
  min-height: 96px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.68);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.meta-card strong {
  font-size: 28px;
  line-height: 1.1;
  color: var(--color-text-main);
}

.meta-card span {
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
}

.hero-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn,
.read-btn,
.text-btn {
  transition: all 0.2s ease;
}

.hero-btn,
.read-btn {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 700;
}

.hero-btn:hover,
.read-btn:hover,
.text-btn:hover,
.quick-tag:hover,
.card-cover-wrap:hover {
  transform: translateY(-1px);
}

.hero-btn.primary,
.read-btn,
.text-btn.primary {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #fff;
  box-shadow: 0 14px 28px rgba(14, 165, 233, 0.2);
}

.hero-btn.ghost,
.quick-tag,
.text-btn {
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
}

.hero-feature {
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.72);
}

.feature-cover-wrap {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.feature-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.hero-feature:hover .feature-cover {
  transform: scale(1.03);
}

.feature-body {
  padding: 22px;
}

.feature-top,
.card-meta,
.card-footer,
.footer-meta,
.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.feature-pill,
.meta-pill,
.tag-chip,
.section-count {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.feature-pill,
.meta-pill.category {
  background: var(--color-primary-bg);
  color: var(--color-primary-text);
  border: 1px solid var(--color-primary-border);
}

.feature-date,
.meta-text,
.section-head p,
.card-body p {
  color: var(--color-text-muted);
}

.feature-body h2 {
  margin: 16px 0 10px;
  font-size: 24px;
  line-height: 1.35;
  color: var(--color-text-main);
}

.feature-body p {
  margin: 0;
  font-size: 14px;
  line-height: 1.85;
}

.feature-tags,
.card-tags,
.quick-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.feature-tags {
  margin-top: 16px;
}

.tag-chip,
.section-count,
.quick-tag {
  background: var(--color-tag);
  border: 1px solid var(--color-border);
  color: var(--color-pill-text);
}

.tag-chip.muted {
  background: rgba(255, 255, 255, 0.72);
}

.read-btn {
  margin-top: 18px;
}

.blog-filter {
  padding: 18px;
}

.filter-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) repeat(2, minmax(0, 0.7fr));
  gap: 14px;
  width: 100%;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.filter-field.grow {
  min-width: 220px;
}

.filter-field span {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-pill-text);
}

.filter-input,
.filter-select {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-main);
  outline: none;
  transition: all 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  border-color: var(--color-primary-border);
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.08);
}

.quick-tags {
  margin-top: 14px;
}

.quick-tag {
  min-height: 34px;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 700;
}

.quick-tag.active {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
  color: var(--color-primary-text);
}

.blog-list-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
}

.section-head h3 {
  margin: 0;
  font-size: 24px;
  color: var(--color-text-main);
}

.section-head p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.8;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.article-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-cover-wrap {
  display: block;
  padding: 0;
  margin: 0;
  border-radius: 0;
}

.card-cover {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.card-body h4 {
  margin: 0;
  font-size: 20px;
  line-height: 1.4;
  color: var(--color-text-main);
}

.card-body p {
  margin: 0;
  font-size: 14px;
  line-height: 1.85;
  flex: 1;
}

.footer-meta {
  gap: 12px;
  justify-content: flex-start;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.footer-actions {
  gap: 8px;
}

.text-btn {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.empty-state {
  min-height: 280px;
  padding: 24px;
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--color-primary-bg);
  color: var(--color-primary-text);
  font-weight: 700;
  font-size: 18px;
}

.empty-state h4 {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-main);
}

.empty-state p {
  margin: 0;
  max-width: 520px;
  color: var(--color-text-muted);
  line-height: 1.85;
}

@media (max-width: 1320px) {
  .blog-hero,
  .article-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .blog-home-page {
    padding: 18px;
  }

  .blog-hero,
  .hero-meta,
  .filter-grid,
  .article-grid {
    grid-template-columns: 1fr;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .blog-home-page {
    padding: 14px;
  }

  .blog-hero,
  .blog-filter,
  .empty-state {
    padding: 16px;
  }

  .feature-body,
  .card-body {
    padding: 16px;
  }

  .hero-actions,
  .footer-actions {
    width: 100%;
  }

  .hero-btn,
  .read-btn,
  .text-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

<template>
  <LedgerShell
    eyebrow="LIFE LEDGER / DIARY"
    title="心事日记"
    description="仅本人可见，支持按日期自动归档、日历视图查阅、文字 / 表情 / 图片记录，以及心情、天气、关键词检索。整体采用纸质日记风格，让书写更有仪式感。"
    :meta-list="[
      '仅本人可见',
      `${store.diaries.length} 篇日记`,
      `${archiveGroups.length} 个归档月份`,
    ]"
  >
    <template #actions>
      <button type="button" class="page-btn ghost" @click="jumpToday">回到今天</button>
      <button type="button" class="page-btn ghost" @click="resetForm">清空当前页</button>
      <button type="button" class="page-btn primary" @click="saveDiary">
        {{ diaryForm.id ? '保存日记' : '写入日记' }}
      </button>
    </template>

    <template #stats>
      <MetricCard
        label="本月记录"
        :value="currentMonthDiaryCount"
        description="按当前日历月份统计，方便持续记录习惯"
        icon="📅"
        trend="日历联动"
        trend-tone="primary"
      />
      <MetricCard
        label="关键词命中"
        :value="filteredDiaries.length"
        description="支持标题、正文、关键词和日期检索"
        icon="🔎"
        trend="全文筛选"
        trend-tone="warning"
      />
      <MetricCard
        label="已收录图片"
        :value="totalImages"
        description="每篇日记可记录多张当日照片或截图"
        icon="🖼"
        trend="图文并存"
        trend-tone="success"
      />
      <MetricCard
        label="心情天气"
        :value="`${selectedMoodLabel} / ${selectedWeatherLabel}`"
        description="记录当天情绪与天气，让回忆更完整"
        icon="☁️"
        trend="纸感手账"
        trend-tone="primary"
      />
    </template>

    <template #toolbar>
      <div class="toolbar-grid">
        <label class="toolbar-field grow">
          <span>检索日记</span>
          <input
            v-model.trim="keyword"
            class="shell-input"
            type="text"
            placeholder="搜索标题、正文、关键词或日期"
          />
        </label>

        <label class="toolbar-field">
          <span>心情筛选</span>
          <select v-model="moodFilter" class="shell-select">
            <option value="all">全部</option>
            <option v-for="item in moodOptions" :key="item.value" :value="item.value">
              {{ item.emoji }} {{ item.label }}
            </option>
          </select>
        </label>

        <label class="toolbar-field">
          <span>天气筛选</span>
          <select v-model="weatherFilter" class="shell-select">
            <option value="all">全部</option>
            <option v-for="item in weatherOptions" :key="item.value" :value="item.value">
              {{ item.emoji }} {{ item.label }}
            </option>
          </select>
        </label>
      </div>
    </template>

    <section class="diary-page-grid">
      <aside class="left-column">
        <article class="privacy-card glass-panel">
          <div class="privacy-badge">PRIVATE ONLY</div>
          <h3>只有你能看到这些心事</h3>
          <p>
            心事日记不会进入公开博客主页，也不生成外部分享链接。它更像一本收在抽屉里的纸质日记，安静、私密、慢慢累积。
          </p>
        </article>

        <article class="calendar-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>日历视图</h3>
              <p>点击日期即可查阅或开始书写当日内容。</p>
            </div>

            <div class="calendar-nav">
              <button type="button" class="mini-btn ghost" @click="shiftMonth(-1)">‹</button>
              <button type="button" class="mini-btn ghost" @click="shiftMonth(1)">›</button>
            </div>
          </div>

          <div class="calendar-title-row">
            <strong>{{ currentMonthLabel }}</strong>
            <button type="button" class="text-btn" @click="jumpToday">今天</button>
          </div>

          <div class="calendar-weekdays">
            <span v-for="item in weekdayLabels" :key="item">{{ item }}</span>
          </div>

          <div class="calendar-grid">
            <button
              v-for="cell in calendarCells"
              :key="cell.key"
              type="button"
              class="calendar-cell"
              :class="{
                muted: !cell.inMonth,
                today: cell.isToday,
                active: cell.date === selectedDate,
                recorded: cell.hasDiary,
              }"
              @click="selectDate(cell.date)"
            >
              <span class="cell-day">{{ cell.day }}</span>
              <span v-if="cell.hasDiary" class="cell-dot"></span>
            </button>
          </div>
        </article>

        <article class="archive-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>自动归档</h3>
              <p>按照年月自动整理，快速翻阅过去写下的内容。</p>
            </div>
            <span class="count-chip">{{ archiveGroups.length }} 个月</span>
          </div>

          <div class="archive-list">
            <div v-for="group in archiveGroups" :key="group.month" class="archive-group">
              <div class="archive-month">
                <strong>{{ group.label }}</strong>
                <span>{{ group.items.length }} 篇</span>
              </div>

              <button
                v-for="item in group.items"
                :key="item.id"
                type="button"
                class="archive-item"
                :class="{ active: item.date === selectedDate }"
                @click="openDiary(item.date)"
              >
                <div class="archive-item-top">
                  <span>{{ item.date }}</span>
                  <span>{{ moodMap[item.mood].emoji }} {{ weatherMap[item.weather].emoji }}</span>
                </div>
                <strong>{{ item.title || '未命名日记' }}</strong>
                <p>{{ diaryExcerpt(item.content) }}</p>
              </button>
            </div>
          </div>
        </article>
      </aside>

      <section class="right-column">
        <article class="editor-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>纸质日记页</h3>
              <p>支持文字、表情、图片、心情和天气标记，保留柔和纸感书写体验。</p>
            </div>

            <div class="editor-actions">
              <button type="button" class="mini-btn ghost" @click="insertCurrentTime">插入时间</button>
              <button type="button" class="mini-btn danger" @click="removeCurrentDiary">删除当前页</button>
            </div>
          </div>

          <div class="form-grid">
            <label class="toolbar-field">
              <span>日期</span>
              <input v-model="diaryForm.date" class="shell-input" type="date" @change="syncSelectedDate" />
            </label>

            <label class="toolbar-field">
              <span>标题</span>
              <input
                v-model.trim="diaryForm.title"
                class="shell-input"
                type="text"
                placeholder="例如：晚风很轻的一天"
              />
            </label>

            <label class="toolbar-field span-2">
              <span>关键词（逗号分隔）</span>
              <input
                v-model="keywordsInput"
                class="shell-input"
                type="text"
                placeholder="例如：晚霞, 散步, 书桌, 周末"
              />
            </label>
          </div>

          <div class="mood-weather-row">
            <div class="selector-card">
              <div class="mini-title">心情标记</div>
              <div class="pill-group">
                <button
                  v-for="item in moodOptions"
                  :key="item.value"
                  type="button"
                  class="emoji-pill"
                  :class="{ active: diaryForm.mood === item.value }"
                  @click="diaryForm.mood = item.value"
                >
                  <span>{{ item.emoji }}</span>
                  <span>{{ item.label }}</span>
                </button>
              </div>
            </div>

            <div class="selector-card">
              <div class="mini-title">天气标记</div>
              <div class="pill-group">
                <button
                  v-for="item in weatherOptions"
                  :key="item.value"
                  type="button"
                  class="emoji-pill"
                  :class="{ active: diaryForm.weather === item.value }"
                  @click="diaryForm.weather = item.value"
                >
                  <span>{{ item.emoji }}</span>
                  <span>{{ item.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="emoji-board glass-sub">
            <div class="emoji-head">
              <strong>表情贴纸</strong>
              <span>轻点即可加入到本页情绪标签中</span>
            </div>

            <div class="emoji-list">
              <button
                v-for="item in emojiOptions"
                :key="item"
                type="button"
                class="emoji-chip"
                :class="{ active: diaryForm.emojis.includes(item) }"
                @click="toggleEmoji(item)"
              >
                {{ item }}
              </button>
            </div>
          </div>

          <div class="paper-wrap">
            <div class="paper-header">
              <div>
                <strong>{{ diaryForm.title || `${diaryForm.date} 的心情页` }}</strong>
                <span>{{ selectedMoodLabel }} · {{ selectedWeatherLabel }}</span>
              </div>
              <div class="paper-right">
                <span>{{ diaryForm.date }}</span>
                <span>{{ diaryForm.emojis.join(' ') || '✦' }}</span>
              </div>
            </div>

            <textarea
              v-model="diaryForm.content"
              class="paper-editor"
              placeholder="今天过得怎么样？写下一些只属于自己的文字吧……"
            />
          </div>

          <div class="image-panel glass-sub">
            <div class="image-head">
              <div>
                <strong>图片记录</strong>
                <span>可添加当日照片、截图、纪念图等内容</span>
              </div>

              <div class="image-actions">
                <button type="button" class="mini-btn ghost" @click="triggerImageInput">上传图片</button>
                <input
                  ref="imageInputRef"
                  class="hidden-input"
                  type="file"
                  accept="image/*"
                  multiple
                  @change="handleImageChange"
                />
              </div>
            </div>

            <div v-if="diaryForm.images.length" class="image-grid">
              <div v-for="(item, index) in diaryForm.images" :key="`${item}-${index}`" class="image-card">
                <img :src="item" :alt="`diary-${index}`" />
                <button type="button" class="remove-image-btn" @click="removeImage(index)">×</button>
              </div>
            </div>
            <div v-else class="empty-inline">还没有图片记录，可以上传几张属于这一天的照片。</div>
          </div>
        </article>

        <article class="result-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>检索结果与最近日记</h3>
              <p>支持按日期、关键词、心情和天气快速回看。</p>
            </div>
            <span class="count-chip">{{ filteredDiaries.length }} 篇</span>
          </div>

          <div class="result-list">
            <button
              v-for="item in filteredDiaries"
              :key="item.id"
              type="button"
              class="result-card"
              :class="{ active: item.date === selectedDate }"
              @click="openDiary(item.date)"
            >
              <div class="result-card-top">
                <div class="badge-stack">
                  <span class="tiny-badge primary">{{ moodMap[item.mood].emoji }} {{ moodMap[item.mood].label }}</span>
                  <span class="tiny-badge soft">{{ weatherMap[item.weather].emoji }} {{ weatherMap[item.weather].label }}</span>
                </div>
                <span class="date-text">{{ item.date }}</span>
              </div>

              <h4>{{ item.title || '未命名日记' }}</h4>
              <p>{{ diaryExcerpt(item.content) }}</p>

              <div class="result-tags">
                <span v-for="tag in item.keywords" :key="tag" class="tag-pill"># {{ tag }}</span>
              </div>

              <div class="result-meta">
                <span>{{ item.emojis.join(' ') || '✦' }}</span>
                <span>{{ item.images.length }} 张图片</span>
                <span>{{ formatDate(item.updatedAt) }}</span>
              </div>
            </button>

            <div v-if="!filteredDiaries.length" class="empty-state">
              <div class="empty-icon">☾</div>
              <p>没有符合条件的日记，试试换一个关键词，或者写下新的心事。</p>
            </div>
          </div>
        </article>
      </section>
    </section>
  </LedgerShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import LedgerShell from '../components/LedgerShell.vue'
import MetricCard from '../components/MetricCard.vue'
import { useLifeLedgerStore } from '@/stores/life-ledger'
import type { DiaryEntry, DiaryMood, DiaryWeather } from '@/types/life-ledger'
import {
  clipText,
  formatDate,
  formatMonthLabel,
  normalizeKeywordList,
  readFilesAsDataUrls,
  toDayKey,
  toMonthKey,
} from '@/utils/life-ledger'

type DiaryForm = {
  id?: string
  date: string
  title: string
  content: string
  mood: DiaryMood
  weather: DiaryWeather
  emojis: string[]
  images: string[]
}

const store = useLifeLedgerStore()
const toast = useToast()

const imageInputRef = ref<HTMLInputElement>()
const keyword = ref('')
const moodFilter = ref<'all' | DiaryMood>('all')
const weatherFilter = ref<'all' | DiaryWeather>('all')
const today = toDayKey(new Date())
const selectedDate = ref(today)
const currentMonth = ref(`${today.slice(0, 7)}-01`)
const keywordsInput = ref('')

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

const moodOptions = [
  { value: 'calm', label: '平静', emoji: '😌' },
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'excited', label: '雀跃', emoji: '🤩' },
  { value: 'tired', label: '疲惫', emoji: '😮‍💨' },
  { value: 'anxious', label: '焦虑', emoji: '😣' },
  { value: 'sad', label: '低落', emoji: '🥺' },
  { value: 'hopeful', label: '充满期待', emoji: '🌤' },
] as const

const weatherOptions = [
  { value: 'sunny', label: '晴天', emoji: '☀️' },
  { value: 'cloudy', label: '多云', emoji: '☁️' },
  { value: 'rainy', label: '雨天', emoji: '🌧' },
  { value: 'windy', label: '有风', emoji: '🍃' },
  { value: 'snowy', label: '下雪', emoji: '❄️' },
  { value: 'foggy', label: '有雾', emoji: '🌫' },
] as const

const moodMap = Object.fromEntries(moodOptions.map((item) => [item.value, item])) as Record<
  DiaryMood,
  (typeof moodOptions)[number]
>

const weatherMap = Object.fromEntries(weatherOptions.map((item) => [item.value, item])) as Record<
  DiaryWeather,
  (typeof weatherOptions)[number]
>

const emojiOptions = ['🌆', '🍃', '☕️', '📖', '🫖', '✨', '🌙', '💭', '🎧', '🕯️', '💌', '🍰']

const diaryForm = reactive<DiaryForm>({
  id: '',
  date: today,
  title: '',
  content: '',
  mood: 'calm',
  weather: 'cloudy',
  emojis: [],
  images: [],
})

const selectedMoodLabel = computed(() => moodMap[diaryForm.mood]?.label || '平静')
const selectedWeatherLabel = computed(() => weatherMap[diaryForm.weather]?.label || '多云')
const totalImages = computed(() => store.diaries.reduce((sum, item) => sum + item.images.length, 0))

const currentMonthDiaryCount = computed(() => {
  const key = currentMonth.value.slice(0, 7)
  return store.diaries.filter((item) => item.date.startsWith(key)).length
})

const filteredDiaries = computed(() => {
  const search = keyword.value.trim().toLowerCase()

  return [...store.diaries]
    .filter((item) => {
      if (moodFilter.value !== 'all' && item.mood !== moodFilter.value) return false
      if (weatherFilter.value !== 'all' && item.weather !== weatherFilter.value) return false

      if (!search) return true

      return [item.title, item.content, item.keywords.join(' '), item.date]
        .join(' ')
        .toLowerCase()
        .includes(search)
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1))
})

const archiveGroups = computed(() => {
  const map = new Map<string, DiaryEntry[]>()

  ;[...store.diaries]
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .forEach((item) => {
      const month = item.date.slice(0, 7)
      const group = map.get(month) || []
      group.push(item)
      map.set(month, group)
    })

  return [...map.entries()].map(([month, items]) => ({
    month,
    label: formatMonthLabel(`${month}-01`),
    items,
  }))
})

const currentMonthLabel = computed(() => formatMonthLabel(currentMonth.value))

const calendarCells = computed(() => {
  const baseDate = new Date(currentMonth.value)
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const offset = (firstDay.getDay() + 6) % 7
  const startDate = new Date(year, month, 1 - offset)

  return Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)
    const dayKey = toDayKey(date)
    return {
      key: `${dayKey}-${index}`,
      date: dayKey,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: dayKey === today,
      hasDiary: store.diaries.some((item) => item.date === dayKey),
    }
  })
})

const diaryExcerpt = (content: string) => clipText((content || '').replace(/\n+/g, ' ').trim(), 92)

const loadDiaryByDate = (date: string) => {
  const current = store.diaries.find((item) => item.date === date)

  selectedDate.value = date
  currentMonth.value = `${date.slice(0, 7)}-01`

  if (!current) {
    diaryForm.id = ''
    diaryForm.date = date
    diaryForm.title = ''
    diaryForm.content = ''
    diaryForm.mood = 'calm'
    diaryForm.weather = 'cloudy'
    diaryForm.emojis = []
    diaryForm.images = []
    keywordsInput.value = ''
    return
  }

  diaryForm.id = current.id
  diaryForm.date = current.date
  diaryForm.title = current.title
  diaryForm.content = current.content
  diaryForm.mood = current.mood
  diaryForm.weather = current.weather
  diaryForm.emojis = [...current.emojis]
  diaryForm.images = [...current.images]
  keywordsInput.value = current.keywords.join(', ')
}

const openDiary = (date: string) => {
  loadDiaryByDate(date)
}

const selectDate = (date: string) => {
  loadDiaryByDate(date)
}

const resetForm = () => {
  diaryForm.id = ''
  diaryForm.date = selectedDate.value
  diaryForm.title = ''
  diaryForm.content = ''
  diaryForm.mood = 'calm'
  diaryForm.weather = 'cloudy'
  diaryForm.emojis = []
  diaryForm.images = []
  keywordsInput.value = ''
}

const jumpToday = () => {
  loadDiaryByDate(today)
}

const shiftMonth = (step: number) => {
  const base = new Date(currentMonth.value)
  base.setMonth(base.getMonth() + step)
  currentMonth.value = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-01`
}

const syncSelectedDate = () => {
  if (!diaryForm.date) return
  selectedDate.value = diaryForm.date
  currentMonth.value = `${diaryForm.date.slice(0, 7)}-01`
}

const toggleEmoji = (emoji: string) => {
  if (diaryForm.emojis.includes(emoji)) {
    diaryForm.emojis = diaryForm.emojis.filter((item) => item !== emoji)
  } else {
    diaryForm.emojis = [...diaryForm.emojis, emoji]
  }
}

const insertCurrentTime = () => {
  const time = new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  diaryForm.content = `${diaryForm.content}${diaryForm.content ? '\n' : ''}[${time}] `
}

const triggerImageInput = () => {
  imageInputRef.value?.click()
}

const handleImageChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const images = await readFilesAsDataUrls(input.files)
  diaryForm.images = [...diaryForm.images, ...images]
  input.value = ''
}

const removeImage = (index: number) => {
  diaryForm.images = diaryForm.images.filter((_, currentIndex) => currentIndex !== index)
}

const saveDiary = () => {
  if (!diaryForm.date) {
    toast.add({
      severity: 'warn',
      summary: '请先选择日期',
      life: 2200,
    })
    return
  }

  if (!diaryForm.title.trim() && !diaryForm.content.trim()) {
    toast.add({
      severity: 'warn',
      summary: '请先写下标题或正文',
      life: 2200,
    })
    return
  }

  const saved = store.upsertDiary({
    id: diaryForm.id || undefined,
    date: diaryForm.date,
    title: diaryForm.title.trim() || `${diaryForm.date} 的心事`,
    content: diaryForm.content.trim(),
    mood: diaryForm.mood,
    weather: diaryForm.weather,
    keywords: normalizeKeywordList(keywordsInput.value),
    emojis: diaryForm.emojis,
    images: diaryForm.images,
  })

  loadDiaryByDate(saved.date)

  toast.add({
    severity: 'success',
    summary: '日记已写入并归档',
    life: 2200,
  })
}

const removeCurrentDiary = () => {
  if (!diaryForm.id) {
    resetForm()
    return
  }

  const title = diaryForm.title || `${diaryForm.date} 的心事`
  store.removeDiary(diaryForm.id)
  resetForm()

  toast.add({
    severity: 'success',
    summary: `已删除「${title}」`,
    life: 2200,
  })
}

watch(
  () => selectedDate.value,
  (value) => {
    if (!value) return
    diaryForm.date = value
  },
  { immediate: true },
)

watch(
  () => store.diaries,
  () => {
    if (diaryForm.id) {
      const current = store.diaries.find((item) => item.id === diaryForm.id)
      if (!current) {
        resetForm()
      }
    }
  },
  { deep: true },
)

loadDiaryByDate(today)
</script>

<style scoped lang="scss">
.diary-page-grid {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
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

.privacy-card,
.calendar-panel,
.archive-panel,
.editor-panel,
.result-panel {
  padding: 18px;
}

.privacy-card {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(240, 249, 255, 0.78)),
    var(--color-panel);

  &::after {
    content: '';
    position: absolute;
    right: -26px;
    top: -30px;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: rgba(56, 189, 248, 0.12);
    pointer-events: none;
  }
}

.privacy-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-border);
  color: var(--color-primary-text);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.privacy-card h3 {
  margin: 14px 0 8px;
  font-size: 20px;
  color: var(--color-text-main);
}

.privacy-card p {
  margin: 0;
  line-height: 1.85;
  color: var(--color-text-muted);
  font-size: 13px;
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
  grid-template-columns: minmax(0, 1.6fr) repeat(2, minmax(0, 0.8fr));
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
  min-width: 240px;
}

.toolbar-field span,
.mini-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-pill-text);
}

.shell-input,
.shell-select,
.paper-editor {
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

.shell-input:focus,
.shell-select:focus,
.paper-editor:focus {
  border-color: var(--color-primary-border);
  box-shadow:
    0 0 0 4px rgba(56, 189, 248, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.page-btn,
.mini-btn,
.text-btn,
.emoji-pill,
.emoji-chip {
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
.text-btn:hover,
.emoji-pill:hover,
.emoji-chip:hover,
.archive-item:hover,
.result-card:hover,
.calendar-cell:hover {
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
.emoji-pill,
.emoji-chip,
.calendar-cell,
.archive-item,
.result-card {
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
}

.mini-btn.danger {
  background: rgba(248, 113, 113, 0.12);
  color: #dc2626;
  border: 1px solid rgba(248, 113, 113, 0.2);
  box-shadow: none;
}

.count-chip,
.tag-pill,
.tiny-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.count-chip,
.tag-pill {
  background: var(--color-tag);
  border: 1px solid var(--color-border);
  color: var(--color-pill-text);
}

.tiny-badge.primary {
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-border);
  color: var(--color-primary-text);
}

.tiny-badge.soft {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--color-border);
  color: var(--color-pill-text);
}

.calendar-nav {
  display: flex;
  gap: 8px;
}

.calendar-title-row {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-title-row strong {
  font-size: 18px;
  color: var(--color-text-main);
}

.text-btn {
  color: var(--color-primary-text);
  font-weight: 700;
  font-size: 13px;
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.calendar-weekdays {
  margin-top: 16px;
}

.calendar-weekdays span {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.calendar-grid {
  margin-top: 10px;
}

.calendar-cell {
  position: relative;
  min-height: 54px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.calendar-cell.muted {
  opacity: 0.42;
}

.calendar-cell.today {
  border-color: rgba(14, 165, 233, 0.28);
}

.calendar-cell.active {
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.92), rgba(255, 255, 255, 0.76));
  border-color: var(--color-primary-border);
}

.calendar-cell.recorded .cell-day {
  color: var(--color-primary-text);
  font-weight: 700;
}

.cell-day {
  font-size: 14px;
  color: var(--color-text-main);
}

.cell-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
}

.archive-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 640px;
  overflow: auto;
  padding-right: 4px;
}

.archive-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.archive-month {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-pill-text);
  font-size: 13px;
}

.archive-item,
.result-card {
  text-align: left;
  padding: 14px;
  border-radius: 18px;
}

.archive-item.active,
.result-card.active {
  border-color: var(--color-primary-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(240, 249, 255, 0.9));
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
}

.archive-item-top,
.result-card-top,
.result-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.archive-item strong,
.result-card h4 {
  margin-top: 10px;
  font-size: 15px;
  color: var(--color-text-main);
}

.archive-item p,
.result-card p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.8;
  color: var(--color-text-muted);
}

.editor-actions,
.badge-stack,
.result-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mood-weather-row {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.selector-card,
.glass-sub {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid var(--color-border);
}

.pill-group,
.emoji-list {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.emoji-pill {
  min-height: 38px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
}

.emoji-pill.active,
.emoji-chip.active {
  background: var(--color-primary-bg);
  color: var(--color-primary-text);
  border-color: var(--color-primary-border);
}

.emoji-board {
  margin-top: 18px;
}

.emoji-head,
.image-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.emoji-head strong,
.image-head strong,
.paper-header strong {
  font-size: 15px;
  color: var(--color-text-main);
}

.emoji-head span,
.image-head span,
.paper-header span,
.date-text {
  font-size: 12px;
  color: var(--color-text-muted);
}

.emoji-chip {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.paper-wrap {
  margin-top: 18px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  background:
    linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(255, 251, 239, 0.94));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 20px 40px rgba(15, 23, 42, 0.08);
}

.paper-header {
  min-height: 64px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px dashed rgba(180, 83, 9, 0.18);
  background: rgba(255, 255, 255, 0.4);
}

.paper-header > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.paper-right {
  align-items: flex-end !important;
}

.paper-editor {
  min-height: 420px;
  resize: vertical;
  padding: 24px 22px;
  border: none;
  border-radius: 0;
  background:
    linear-gradient(to right, rgba(251, 113, 133, 0.12) 0, rgba(251, 113, 133, 0.12) 2px, transparent 2px) 48px 0 / 100% 100% no-repeat,
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 34px,
      rgba(148, 163, 184, 0.18) 34px,
      rgba(148, 163, 184, 0.18) 35px
    ),
    linear-gradient(180deg, rgba(255, 253, 247, 0.98), rgba(255, 251, 239, 0.98));
  color: #4b5563;
  line-height: 35px;
  font-size: 15px;
  font-family:
    'STKaiti',
    'KaiTi',
    'Songti SC',
    'PingFang SC',
    serif;
}

.paper-editor::placeholder {
  color: rgba(100, 116, 139, 0.66);
}

.image-panel {
  margin-top: 18px;
}

.image-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hidden-input {
  display: none;
}

.image-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.result-list {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.result-meta {
  margin-top: 14px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.empty-inline,
.empty-state {
  color: var(--color-text-muted);
  font-size: 13px;
}

.empty-state {
  min-height: 220px;
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

@media (max-width: 1280px) {
  .diary-page-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 980px) {
  .toolbar-grid,
  .form-grid,
  .mood-weather-row,
  .result-list,
  .image-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }

  .paper-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .paper-right {
    align-items: flex-start !important;
  }
}

@media (max-width: 640px) {
  .privacy-card,
  .calendar-panel,
  .archive-panel,
  .editor-panel,
  .result-panel {
    padding: 14px;
  }

  .section-head,
  .emoji-head,
  .image-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-btn,
  .mini-btn {
    width: 100%;
  }

  .calendar-cell {
    min-height: 48px;
  }
}
</style>

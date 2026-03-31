<template>
  <LedgerShell
    eyebrow="LIFE LEDGER / MEMO"
    title="日常备忘"
    description="支持快速创建文字备忘与待办事项，提供完成 / 未完成标记、日期提醒、重复提醒、置顶、分类、搜索、归档与轻量优先级排序。"
    :meta-list="[
      `${activeMemos.length} 条进行中`,
      `${doneCount} 条已完成`,
      `${pinnedCount} 条已置顶`,
    ]"
  >
    <template #actions>
      <button type="button" class="page-btn ghost" @click="resetForm">清空表单</button>
      <button type="button" class="page-btn primary" @click="saveMemo">
        {{ memoForm.id ? '保存备忘' : '新建备忘' }}
      </button>
    </template>

    <template #stats>
      <MetricCard
        label="待处理事项"
        :value="pendingCount"
        description="未完成且未归档的备忘 / 待办数量"
        icon="🗂"
        trend="保持轻量推进"
        trend-tone="primary"
      />
      <MetricCard
        label="今日提醒"
        :value="todayReminderCount"
        description="提醒时间落在今天的备忘会优先展示"
        icon="⏰"
        trend="按日期聚焦"
        trend-tone="warning"
      />
      <MetricCard
        label="已完成"
        :value="doneCount"
        description="完成项支持继续保留、复盘或归档"
        icon="✅"
        trend="持续累积"
        trend-tone="success"
      />
      <MetricCard
        label="归档数量"
        :value="archivedCount"
        description="不影响搜索，可随时查看历史记录"
        icon="🗄"
        trend="长期收纳"
        trend-tone="primary"
      />
    </template>

    <template #toolbar>
      <div class="toolbar-grid">
        <label class="toolbar-field grow">
          <span>搜索备忘</span>
          <input
            v-model.trim="keyword"
            class="shell-input"
            type="text"
            placeholder="搜索标题、内容、分类或提醒信息"
          />
        </label>

        <label class="toolbar-field">
          <span>任务类型</span>
          <select v-model="kindFilter" class="shell-select">
            <option value="all">全部</option>
            <option value="text">文字备忘</option>
            <option value="todo">待办事项</option>
          </select>
        </label>

        <label class="toolbar-field">
          <span>状态筛选</span>
          <select v-model="statusFilter" class="shell-select">
            <option value="all">全部</option>
            <option value="pending">未完成</option>
            <option value="done">已完成</option>
            <option value="archived">已归档</option>
          </select>
        </label>

        <label class="toolbar-field">
          <span>分类筛选</span>
          <select v-model="categoryFilter" class="shell-select">
            <option value="all">全部</option>
            <option v-for="item in store.memoCategories" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label class="toolbar-field">
          <span>排序方式</span>
          <select v-model="sortBy" class="shell-select">
            <option value="smart">智能排序</option>
            <option value="priority">优先级</option>
            <option value="remindAt">提醒时间</option>
            <option value="updatedAt">最近更新</option>
          </select>
        </label>
      </div>
    </template>

    <section class="memo-page-grid">
      <aside class="left-column">
        <article class="editor-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>快速创建</h3>
              <p>新建文字备忘或待办事项，支持提醒、重复周期和优先级设置。</p>
            </div>
            <span class="count-chip">{{ memoForm.id ? '编辑中' : '新建中' }}</span>
          </div>

          <div class="form-grid">
            <label class="toolbar-field span-2">
              <span>标题</span>
              <input
                v-model.trim="memoForm.title"
                class="shell-input"
                type="text"
                placeholder="例如：补充文章封面图 / 周末寄快递"
              />
            </label>

            <label class="toolbar-field span-2">
              <span>内容</span>
              <textarea
                v-model.trim="memoForm.content"
                class="shell-textarea"
                placeholder="记录提醒详情、待办说明或临时灵感"
              />
            </label>

            <div class="switch-group span-2">
              <span class="switch-label">类型</span>
              <div class="option-group">
                <button
                  type="button"
                  class="option-btn"
                  :class="{ active: memoForm.kind === 'text' }"
                  @click="memoForm.kind = 'text'"
                >
                  文字备忘
                </button>
                <button
                  type="button"
                  class="option-btn"
                  :class="{ active: memoForm.kind === 'todo' }"
                  @click="memoForm.kind = 'todo'"
                >
                  待办事项
                </button>
              </div>
            </div>

            <label class="toolbar-field">
              <span>分类</span>
              <input
                v-model.trim="memoForm.category"
                class="shell-input"
                list="memo-category-list"
                type="text"
                placeholder="输入或选择分类"
              />
            </label>

            <label class="toolbar-field">
              <span>提醒日期</span>
              <input v-model="memoForm.remindAt" class="shell-input" type="datetime-local" />
            </label>

            <label class="toolbar-field">
              <span>重复提醒</span>
              <select v-model="memoForm.repeat" class="shell-select">
                <option value="none">不重复</option>
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </label>

            <label class="toolbar-field">
              <span>优先级</span>
              <select v-model.number="memoForm.priority" class="shell-select">
                <option :value="1">低优先级</option>
                <option :value="2">中优先级</option>
                <option :value="3">高优先级</option>
              </select>
            </label>
          </div>

          <div class="toggle-row">
            <label class="toggle-pill">
              <input v-model="memoForm.pinned" type="checkbox" />
              <span>置顶显示</span>
            </label>
            <label class="toggle-pill">
              <input v-model="memoForm.done" type="checkbox" />
              <span>标记完成</span>
            </label>
            <label class="toggle-pill">
              <input v-model="memoForm.archived" type="checkbox" />
              <span>直接归档</span>
            </label>
          </div>

          <div class="helper-card">
            <div class="helper-icon">⌁</div>
            <div>
              <h4>轻量优先级排序规则</h4>
              <p>高优先级 ＞ 置顶 ＞ 今日提醒 ＞ 最近更新。适合日常事项快速排队，不会让列表过于复杂。</p>
            </div>
          </div>

          <datalist id="memo-category-list">
            <option v-for="item in store.memoCategories" :key="item" :value="item" />
          </datalist>
        </article>

        <article class="category-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>分类管理</h3>
              <p>维护备忘分类，便于后续检索与归档。</p>
            </div>
            <button type="button" class="mini-btn" @click="saveCategoryLibrary">保存分类</button>
          </div>

          <label class="toolbar-field mt-16">
            <span>分类库（逗号分隔）</span>
            <textarea
              v-model="categoryLibraryInput"
              class="shell-textarea small"
              placeholder="例如：生活, 创作, 效率, 出行"
            />
          </label>

          <div class="chip-group">
            <span v-for="item in store.memoCategories" :key="item" class="inline-chip">
              # {{ item }}
            </span>
          </div>
        </article>
      </aside>

      <section class="right-column">
        <article class="overview-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>提醒与近期事项</h3>
              <p>把今天、近期和置顶任务集中在一起，更适合日常浏览。</p>
            </div>
          </div>

          <div class="overview-grid">
            <div class="overview-card today">
              <span class="overview-label">今日提醒</span>
              <strong>{{ todayReminderCount }}</strong>
              <p>含当天到期或提醒时间在今天的事项</p>
            </div>
            <div class="overview-card pin">
              <span class="overview-label">置顶任务</span>
              <strong>{{ pinnedCount }}</strong>
              <p>优先展示在列表前部</p>
            </div>
            <div class="overview-card archive">
              <span class="overview-label">归档记录</span>
              <strong>{{ archivedCount }}</strong>
              <p>支持搜索和再次编辑</p>
            </div>
          </div>

          <div class="reminder-timeline">
            <div class="mini-title">即将提醒</div>
            <div v-if="upcomingMemos.length" class="timeline-list">
              <div v-for="item in upcomingMemos" :key="item.id" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-body">
                  <div class="timeline-top">
                    <strong>{{ item.title || '未命名备忘' }}</strong>
                    <span>{{ formatDateTime(item.remindAt as string) }}</span>
                  </div>
                  <p>{{ item.content || '等待补充内容' }}</p>
                </div>
              </div>
            </div>
            <div v-else class="empty-inline">近期待提醒事项为空，适合先清空收件箱式记录。</div>
          </div>
        </article>

        <article class="list-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>备忘列表</h3>
              <p>支持完成、置顶、归档、搜索与优先级排序的综合管理。</p>
            </div>
            <span class="count-chip">{{ filteredMemos.length }} 条</span>
          </div>

          <div class="memo-grid">
            <button
              v-for="item in filteredMemos"
              :key="item.id"
              type="button"
              class="memo-card"
              :class="[
                `priority-${item.priority}`,
                {
                  active: item.id === selectedMemoId,
                  done: item.done,
                  archived: item.archived,
                },
              ]"
              @click="selectMemo(item.id)"
            >
              <div class="memo-card-top">
                <div class="badge-stack">
                  <span class="tiny-badge kind">{{ item.kind === 'todo' ? '待办' : '备忘' }}</span>
                  <span class="tiny-badge" :class="item.done ? 'done' : 'pending'">
                    {{ item.done ? '已完成' : '未完成' }}
                  </span>
                  <span v-if="item.archived" class="tiny-badge archived">已归档</span>
                  <span v-if="item.pinned" class="tiny-badge pinned">置顶</span>
                </div>

                <div class="priority-indicator">
                  <span class="priority-dot"></span>
                  {{ priorityLabelMap[item.priority] }}
                </div>
              </div>

              <h4>{{ item.title || '未命名备忘' }}</h4>
              <p>{{ item.content || '点击卡片补充内容详情。' }}</p>

              <div class="meta-row">
                <span class="meta-pill">{{ item.category || '未分类' }}</span>
                <span v-if="item.repeat !== 'none'" class="meta-pill repeat">
                  {{ repeatLabelMap[item.repeat] }}
                </span>
              </div>

              <div class="memo-card-foot">
                <span>{{ item.remindAt ? formatDateTime(item.remindAt) : '未设置提醒' }}</span>
                <span>{{ formatDate(item.updatedAt) }}</span>
              </div>

              <div class="quick-actions" @click.stop>
                <button type="button" class="mini-icon-btn" @click="toggleDone(item.id)">
                  {{ item.done ? '↺' : '✓' }}
                </button>
                <button type="button" class="mini-icon-btn" @click="togglePin(item.id)">📌</button>
                <button type="button" class="mini-icon-btn" @click="toggleArchive(item.id)">🗄</button>
                <button type="button" class="mini-icon-btn danger" @click="removeMemo(item.id)">✕</button>
              </div>
            </button>

            <div v-if="!filteredMemos.length" class="empty-state">
              <div class="empty-icon">☰</div>
              <p>当前条件下没有备忘记录，试试新增一条或调整筛选条件。</p>
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
import type { DailyMemo, MemoRepeat } from '@/types/life-ledger'
import {
  formatDate,
  formatDateTime,
  normalizeKeywordList,
  toDateInputValue,
  toDayKey,
} from '@/utils/life-ledger'

type MemoForm = {
  id?: string
  title: string
  content: string
  kind: 'text' | 'todo'
  done: boolean
  pinned: boolean
  archived: boolean
  category: string
  priority: 1 | 2 | 3
  remindAt: string
  repeat: MemoRepeat
}

const store = useLifeLedgerStore()
const toast = useToast()

const keyword = ref('')
const kindFilter = ref<'all' | 'text' | 'todo'>('all')
const statusFilter = ref<'all' | 'pending' | 'done' | 'archived'>('all')
const categoryFilter = ref('all')
const sortBy = ref<'smart' | 'priority' | 'remindAt' | 'updatedAt'>('smart')
const selectedMemoId = ref('')
const categoryLibraryInput = ref(store.memoCategories.join(', '))

const priorityLabelMap: Record<1 | 2 | 3, string> = {
  1: '低优先级',
  2: '中优先级',
  3: '高优先级',
}

const repeatLabelMap: Record<MemoRepeat, string> = {
  none: '不重复',
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
}

const memoForm = reactive<MemoForm>({
  id: '',
  title: '',
  content: '',
  kind: 'text',
  done: false,
  pinned: false,
  archived: false,
  category: store.memoCategories[0] || '日常',
  priority: 2,
  remindAt: '',
  repeat: 'none',
})

const allMemos = computed(() => [...store.memos])

const activeMemos = computed(() => store.memos.filter((item) => !item.archived))
const pendingCount = computed(() => store.memos.filter((item) => !item.done && !item.archived).length)
const doneCount = computed(() => store.memos.filter((item) => item.done).length)
const pinnedCount = computed(() => store.memos.filter((item) => item.pinned && !item.archived).length)
const archivedCount = computed(() => store.memos.filter((item) => item.archived).length)

const todayReminderCount = computed(() => {
  const today = toDayKey(new Date())
  return store.memos.filter((item) => item.remindAt && toDayKey(item.remindAt) === today).length
})

const upcomingMemos = computed(() =>
  [...store.memos]
    .filter((item) => item.remindAt && !item.archived)
    .sort((a, b) => +new Date(a.remindAt as string) - +new Date(b.remindAt as string))
    .slice(0, 4),
)

const filteredMemos = computed(() => {
  const search = keyword.value.trim().toLowerCase()

  const list = allMemos.value.filter((item) => {
    if (kindFilter.value !== 'all' && item.kind !== kindFilter.value) return false
    if (statusFilter.value === 'pending' && (item.done || item.archived)) return false
    if (statusFilter.value === 'done' && !item.done) return false
    if (statusFilter.value === 'archived' && !item.archived) return false
    if (categoryFilter.value !== 'all' && item.category !== categoryFilter.value) return false

    if (!search) return true

    return [item.title, item.content, item.category, item.repeat, item.remindAt]
      .join(' ')
      .toLowerCase()
      .includes(search)
  })

  const smartScore = (item: DailyMemo) => {
    const today = toDayKey(new Date())
    const remindToday = item.remindAt && toDayKey(item.remindAt) === today ? 1 : 0
    return item.priority * 10 + (item.pinned ? 8 : 0) + remindToday * 6 + (item.done ? -4 : 0) + (item.archived ? -8 : 0)
  }

  return list.sort((a, b) => {
    if (sortBy.value === 'priority') {
      return b.priority - a.priority || Number(b.pinned) - Number(a.pinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt)
    }

    if (sortBy.value === 'remindAt') {
      const aTime = a.remindAt ? +new Date(a.remindAt) : Number.MAX_SAFE_INTEGER
      const bTime = b.remindAt ? +new Date(b.remindAt) : Number.MAX_SAFE_INTEGER
      return aTime - bTime
    }

    if (sortBy.value === 'updatedAt') {
      return +new Date(b.updatedAt) - +new Date(a.updatedAt)
    }

    return smartScore(b) - smartScore(a) || +new Date(b.updatedAt) - +new Date(a.updatedAt)
  })
})

const loadMemoIntoForm = (memo?: DailyMemo) => {
  const current = memo || store.memos.find((item) => item.id === selectedMemoId.value)
  if (!current) {
    resetForm()
    return
  }

  selectedMemoId.value = current.id
  memoForm.id = current.id
  memoForm.title = current.title
  memoForm.content = current.content
  memoForm.kind = current.kind
  memoForm.done = current.done
  memoForm.pinned = current.pinned
  memoForm.archived = current.archived
  memoForm.category = current.category
  memoForm.priority = current.priority
  memoForm.remindAt = current.remindAt ? toDateInputValue(current.remindAt) : ''
  memoForm.repeat = current.repeat
}

const resetForm = () => {
  memoForm.id = ''
  memoForm.title = ''
  memoForm.content = ''
  memoForm.kind = 'text'
  memoForm.done = false
  memoForm.pinned = false
  memoForm.archived = false
  memoForm.category = store.memoCategories[0] || '日常'
  memoForm.priority = 2
  memoForm.remindAt = ''
  memoForm.repeat = 'none'
  selectedMemoId.value = ''
}

const saveCategoryLibrary = () => {
  store.setMemoCategories(normalizeKeywordList(categoryLibraryInput.value))
  categoryLibraryInput.value = store.memoCategories.join(', ')

  toast.add({
    severity: 'success',
    summary: '分类库已更新',
    life: 2000,
  })
}

const saveMemo = () => {
  if (!memoForm.title.trim() && !memoForm.content.trim()) {
    toast.add({
      severity: 'warn',
      summary: '请先填写标题或内容',
      life: 2200,
    })
    return
  }

  const saved = store.upsertMemo({
    id: memoForm.id || undefined,
    title: memoForm.title.trim() || '未命名备忘',
    content: memoForm.content.trim(),
    kind: memoForm.kind,
    done: memoForm.done,
    pinned: memoForm.pinned,
    archived: memoForm.archived,
    category: memoForm.category.trim() || '日常',
    priority: memoForm.priority,
    remindAt: memoForm.remindAt ? new Date(memoForm.remindAt).toISOString() : null,
    repeat: memoForm.repeat,
  })

  selectedMemoId.value = saved.id
  categoryLibraryInput.value = store.memoCategories.join(', ')
  loadMemoIntoForm(saved)

  toast.add({
    severity: 'success',
    summary: memoForm.id ? '备忘已保存' : '新备忘已创建',
    life: 2000,
  })
}

const selectMemo = (id: string) => {
  const target = store.memos.find((item) => item.id === id)
  if (!target) return
  loadMemoIntoForm(target)
}

const toggleDone = (id: string) => {
  store.toggleMemoDone(id)
  const target = store.memos.find((item) => item.id === id)
  if (target && selectedMemoId.value === id) loadMemoIntoForm(target)
}

const togglePin = (id: string) => {
  store.toggleMemoPin(id)
  const target = store.memos.find((item) => item.id === id)
  if (target && selectedMemoId.value === id) loadMemoIntoForm(target)
}

const toggleArchive = (id: string) => {
  store.toggleMemoArchive(id)
  const target = store.memos.find((item) => item.id === id)
  if (target && selectedMemoId.value === id) loadMemoIntoForm(target)
}

const removeMemo = (id: string) => {
  const target = store.memos.find((item) => item.id === id)
  store.removeMemo(id)

  if (selectedMemoId.value === id) {
    const next = store.memos[0]
    if (next) {
      loadMemoIntoForm(next)
    } else {
      resetForm()
    }
  }

  toast.add({
    severity: 'success',
    summary: `已删除「${target?.title || '备忘'}」`,
    life: 2000,
  })
}

watch(
  () => filteredMemos.value,
  (list) => {
    if (!list.length) return
    if (selectedMemoId.value && list.some((item) => item.id === selectedMemoId.value)) return
    if (!selectedMemoId.value) return
    loadMemoIntoForm(list[0])
  },
)

watch(
  () => store.memoCategories,
  () => {
    categoryLibraryInput.value = store.memoCategories.join(', ')
  },
  { deep: true },
)
</script>

<style scoped lang="scss">
.memo-page-grid {
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

.editor-panel,
.category-panel,
.overview-panel,
.list-panel {
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
  grid-template-columns: minmax(0, 1.5fr) repeat(4, minmax(0, 0.72fr));
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
  min-height: 118px;
  padding: 12px 14px;
  resize: vertical;
  line-height: 1.75;
}

.shell-textarea.small {
  min-height: 92px;
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
.option-btn:hover,
.mini-icon-btn:hover {
  transform: translateY(-1px);
}

.page-btn.primary,
.mini-btn {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #fff;
  box-shadow: 0 14px 28px rgba(14, 165, 233, 0.22);
}

.page-btn.ghost,
.option-btn {
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-main);
  border-color: var(--color-border);
}

.option-group,
.switch-group,
.toggle-row,
.badge-stack,
.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.switch-group {
  margin-top: 16px;
}

.option-btn.active {
  color: var(--color-primary-text);
  border-color: var(--color-primary-border);
  background: var(--color-primary-bg);
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

.helper-card {
  margin-top: 18px;
  padding: 16px;
  border-radius: 18px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 14px;
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.72), rgba(255, 255, 255, 0.72));
  border: 1px solid rgba(125, 211, 252, 0.2);
}

.helper-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(14, 165, 233, 0.12);
  color: var(--color-primary-text);
  font-weight: 700;
}

.helper-card h4 {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-main);
}

.helper-card p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.75;
  color: var(--color-text-muted);
}

.chip-group {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.inline-chip,
.count-chip,
.meta-pill {
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
.meta-pill {
  background: var(--color-tag);
  border: 1px solid var(--color-border);
  color: var(--color-pill-text);
}

.meta-pill.repeat {
  background: rgba(125, 211, 252, 0.14);
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
  background: rgba(255, 255, 255, 0.66);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.overview-card strong {
  font-size: 32px;
  line-height: 1.1;
  color: var(--color-text-main);
}

.overview-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--color-text-muted);
}

.overview-card.today {
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.92), rgba(255, 255, 255, 0.72));
}

.overview-card.pin {
  background: linear-gradient(135deg, rgba(254, 249, 195, 0.88), rgba(255, 255, 255, 0.72));
}

.overview-card.archive {
  background: linear-gradient(135deg, rgba(243, 232, 255, 0.88), rgba(255, 255, 255, 0.72));
}

.overview-label,
.mini-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-pill-text);
}

.reminder-timeline {
  margin-top: 20px;
}

.timeline-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 12px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #38bdf8;
  margin-top: 8px;
  box-shadow: 0 0 0 5px rgba(56, 189, 248, 0.12);
}

.timeline-body {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.62);
}

.timeline-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.timeline-top strong {
  font-size: 14px;
  color: var(--color-text-main);
}

.timeline-top span,
.empty-inline {
  color: var(--color-text-muted);
  font-size: 12px;
}

.timeline-body p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.75;
  color: var(--color-text-muted);
}

.memo-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.memo-card {
  position: relative;
  text-align: left;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.64);
  transition: all 0.22s ease;
  overflow: hidden;
}

.memo-card::after {
  content: '';
  position: absolute;
  inset: auto -24px -40px auto;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.08);
  pointer-events: none;
}

.memo-card:hover,
.memo-card.active {
  transform: translateY(-2px);
  border-color: var(--color-primary-border);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}

.memo-card.done {
  opacity: 0.88;
}

.memo-card.archived {
  background: rgba(248, 250, 252, 0.9);
}

.memo-card.priority-3 {
  border-color: rgba(248, 113, 113, 0.18);
}

.memo-card.priority-2 {
  border-color: rgba(250, 204, 21, 0.18);
}

.memo-card-top,
.memo-card-foot,
.quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: space-between;
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

.tiny-badge.kind {
  color: var(--color-primary-text);
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-border);
}

.tiny-badge.pending {
  color: #d97706;
  background: rgba(253, 230, 138, 0.24);
  border: 1px solid rgba(253, 230, 138, 0.28);
}

.tiny-badge.done {
  color: #047857;
  background: rgba(167, 243, 208, 0.28);
  border: 1px solid rgba(167, 243, 208, 0.32);
}

.tiny-badge.archived {
  color: #7c3aed;
  background: rgba(233, 213, 255, 0.32);
  border: 1px solid rgba(233, 213, 255, 0.38);
}

.tiny-badge.pinned {
  color: #0f766e;
  background: rgba(153, 246, 228, 0.28);
  border: 1px solid rgba(153, 246, 228, 0.36);
}

.priority-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
}

.memo-card.priority-3 .priority-dot {
  background: #ef4444;
}

.memo-card.priority-1 .priority-dot {
  background: #22c55e;
}

.memo-card h4 {
  margin: 14px 0 8px;
  font-size: 17px;
  line-height: 1.45;
  color: var(--color-text-main);
}

.memo-card p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.8;
  min-height: 68px;
}

.meta-row {
  margin-top: 14px;
}

.memo-card-foot {
  margin-top: 14px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.quick-actions {
  margin-top: 14px;
  justify-content: flex-start;
}

.mini-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-text-main);
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.mini-icon-btn.danger {
  color: #dc2626;
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
  .memo-page-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1080px) {
  .toolbar-grid,
  .form-grid,
  .overview-grid,
  .memo-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .editor-panel,
  .category-panel,
  .overview-panel,
  .list-panel {
    padding: 14px;
  }

  .section-head {
    flex-direction: column;
  }

  .page-btn,
  .mini-btn {
    width: 100%;
  }
}
</style>

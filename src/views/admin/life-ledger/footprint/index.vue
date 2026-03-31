<template>
  <LedgerShell
    eyebrow="LIFE LEDGER / FOOTPRINT"
    title="足迹打卡"
    description="支持 Leaflet 地图可视化展示、定位打卡、地点 / 时间 / 描述 / 图片记录、自动生成足迹地图与时间线、按年月统计，以及隐藏 / 分享 / 导出旅行或生活轨迹。"
    :meta-list="[
      `${store.footprints.length} 条足迹`,
      `${visibleCount} 条可见`,
      `${monthSummary.length} 个活跃月份`,
    ]"
  >
    <template #actions>
      <button type="button" class="page-btn ghost" @click="locateCurrentPosition">定位打卡</button>
      <button type="button" class="page-btn ghost" @click="exportMarkdownTracks">导出 Markdown</button>
      <button type="button" class="page-btn primary" @click="saveRecord">
        {{ footprintForm.id ? '保存足迹' : '创建足迹' }}
      </button>
    </template>

    <template #stats>
      <MetricCard
        label="全部足迹"
        :value="store.footprints.length"
        description="旅行、散步、生活片段都可以作为独立打卡记录保留下来"
        icon="📍"
        trend="地图联动"
        trend-tone="primary"
      />
      <MetricCard
        label="当前可见"
        :value="visibleCount"
        description="隐藏记录不会出现在可见轨迹和分享摘要中"
        icon="🧭"
        trend="隐私可控"
        trend-tone="success"
      />
      <MetricCard
        label="筛选命中"
        :value="filteredFootprints.length"
        description="支持按关键词、年月和隐藏状态筛选"
        icon="🔎"
        trend="时间线检索"
        trend-tone="warning"
      />
      <MetricCard
        label="分享开启"
        :value="sharedCount"
        description="已标记分享的记录可快速生成摘要文案"
        icon="🚀"
        trend="摘要复制"
        trend-tone="primary"
      />
    </template>

    <template #toolbar>
      <div class="toolbar-grid">
        <label class="toolbar-field grow">
          <span>搜索足迹</span>
          <input
            v-model.trim="keyword"
            class="shell-input"
            type="text"
            placeholder="搜索地点、标题、描述、标签"
          />
        </label>

        <label class="toolbar-field">
          <span>按月份筛选</span>
          <select v-model="monthFilter" class="shell-select">
            <option value="all">全部月份</option>
            <option v-for="item in monthSummary" :key="item.month" :value="item.month">
              {{ item.label }}（{{ item.count }}）
            </option>
          </select>
        </label>

        <label class="toolbar-field">
          <span>可见状态</span>
          <select v-model="visibilityFilter" class="shell-select">
            <option value="all">全部记录</option>
            <option value="visible">仅可见</option>
            <option value="hidden">仅隐藏</option>
            <option value="shared">仅分享中</option>
          </select>
        </label>
      </div>
    </template>

    <section class="footprint-page-grid">
      <aside class="left-column">
        <article class="editor-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>足迹表单</h3>
              <p>支持地图点击取点、浏览器定位、图片上传和标签管理。</p>
            </div>

            <div class="editor-actions">
              <button type="button" class="mini-btn ghost" @click="resetForm">清空表单</button>
              <button type="button" class="mini-btn danger" @click="removeCurrentRecord">删除记录</button>
            </div>
          </div>

          <div class="helper-card">
            <div class="helper-icon">⌖</div>
            <div>
              <h4>取点方式</h4>
              <p>你可以直接点击地图设置经纬度，也可以使用“定位打卡”获取当前位置，再补充地点名称与描述。</p>
            </div>
          </div>

          <div class="form-grid">
            <label class="toolbar-field span-2">
              <span>足迹标题</span>
              <input
                v-model.trim="footprintForm.title"
                class="shell-input"
                type="text"
                placeholder="例如：滨江步道夜跑 / 周末逛书店 / 城市晨光"
              />
            </label>

            <label class="toolbar-field span-2">
              <span>地点名称</span>
              <input
                v-model.trim="footprintForm.address"
                class="shell-input"
                type="text"
                placeholder="例如：杭州·钱江新城滨江步道"
              />
            </label>

            <label class="toolbar-field">
              <span>打卡时间</span>
              <input v-model="footprintForm.date" class="shell-input" type="datetime-local" />
            </label>

            <label class="toolbar-field">
              <span>标签（逗号分隔）</span>
              <input
                v-model="tagsInput"
                class="shell-input"
                type="text"
                placeholder="例如：旅行, 夜景, 阅读"
              />
            </label>

            <label class="toolbar-field">
              <span>纬度</span>
              <input
                v-model.number="footprintForm.lat"
                class="shell-input"
                type="number"
                step="0.000001"
                placeholder="例如：30.274100"
              />
            </label>

            <label class="toolbar-field">
              <span>经度</span>
              <input
                v-model.number="footprintForm.lng"
                class="shell-input"
                type="number"
                step="0.000001"
                placeholder="例如：120.155100"
              />
            </label>

            <label class="toolbar-field span-2">
              <span>文字描述</span>
              <textarea
                v-model.trim="footprintForm.description"
                class="shell-textarea"
                placeholder="记录此刻的风景、感受、旅行片段或生活情绪"
              />
            </label>
          </div>

          <div class="switch-row">
            <label class="toggle-pill">
              <input v-model="footprintForm.hidden" type="checkbox" />
              <span>隐藏足迹</span>
            </label>

            <label class="toggle-pill">
              <input v-model="footprintForm.shared" type="checkbox" />
              <span>标记为分享中</span>
            </label>

            <div class="meta-hint">
              <span>当前月份：{{ currentFormMonthLabel }}</span>
              <span>{{ currentFormCoordText }}</span>
            </div>
          </div>

          <div class="tag-suggestion">
            <button
              v-for="item in recommendedTags"
              :key="item"
              type="button"
              class="tag-chip-btn"
              @click="appendTag(item)"
            >
              # {{ item }}
            </button>
          </div>

          <div class="image-panel glass-sub">
            <div class="image-head">
              <div>
                <strong>图片记录</strong>
                <span>可附加多张旅行照片、现场截图或生活影像</span>
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

            <div v-if="footprintForm.images.length" class="image-grid">
              <div
                v-for="(item, index) in footprintForm.images"
                :key="`${item}-${index}`"
                class="image-card"
              >
                <img :src="item" :alt="`footprint-${index}`" />
                <button type="button" class="remove-image-btn" @click="removeImage(index)">×</button>
              </div>
            </div>
            <div v-else class="empty-inline">还没有附加图片，可以上传记录这一刻的现场照片。</div>
          </div>
        </article>

        <article class="share-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>分享与导出</h3>
              <p>支持复制当前筛选结果的分享摘要，也可以导出 JSON / Markdown 轨迹。</p>
            </div>
          </div>

          <div class="share-card">
            <div class="share-top">
              <span class="share-mark">轨迹摘要</span>
              <span>{{ filteredFootprints.length }} 条记录</span>
            </div>
            <p>{{ shareSummary }}</p>
          </div>

          <div class="share-actions">
            <button type="button" class="mini-btn" @click="copyShareSummary">复制分享摘要</button>
            <button type="button" class="mini-btn ghost" @click="exportJsonTracks">导出 JSON</button>
            <button type="button" class="mini-btn ghost" @click="exportMarkdownTracks">导出 Markdown</button>
          </div>
        </article>
      </aside>

      <section class="right-column">
        <FootprintMap
          :points="mapPoints"
          :selected-id="selectedFootprintId || null"
          :interactive="true"
          height="460px"
          @point-click="selectRecord"
          @map-click="handleMapClick"
        />

        <article class="summary-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>按年月统计</h3>
              <p>自动统计活跃月份，适合回顾旅行频率与生活轨迹密度。</p>
            </div>
          </div>

          <div class="month-grid">
            <button
              v-for="item in monthSummary"
              :key="item.month"
              type="button"
              class="month-card"
              :class="{ active: monthFilter === item.month }"
              @click="monthFilter = monthFilter === item.month ? 'all' : item.month"
            >
              <span class="month-label">{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
              <em>{{ item.count > 1 ? '足迹活跃' : '留下了一次记录' }}</em>
            </button>
          </div>
        </article>

        <article class="timeline-panel glass-panel">
          <div class="section-head">
            <div>
              <h3>时间线</h3>
              <p>地图与时间线联动，点击即可高亮并编辑对应足迹。</p>
            </div>
            <span class="count-chip">{{ filteredFootprints.length }} 条</span>
          </div>

          <div class="timeline-list">
            <button
              v-for="item in filteredFootprints"
              :key="item.id"
              type="button"
              class="timeline-item"
              :class="{ active: item.id === selectedFootprintId, hidden: item.hidden }"
              @click="selectRecord(item.id)"
            >
              <div class="timeline-marker">
                <span class="dot"></span>
              </div>

              <div class="timeline-body">
                <div class="timeline-top">
                  <div class="badge-stack">
                    <span class="tiny-badge primary">{{ formatDateTime(item.date) }}</span>
                    <span v-if="item.hidden" class="tiny-badge hidden">已隐藏</span>
                    <span v-if="item.shared" class="tiny-badge shared">分享中</span>
                  </div>
                  <span class="coord-text">{{ item.lat.toFixed(4) }}, {{ item.lng.toFixed(4) }}</span>
                </div>

                <h4>{{ item.title }}</h4>
                <div class="address-line">{{ item.address }}</div>
                <p>{{ clipText(item.description || '点击记录更多细节与感受。', 120) }}</p>

                <div class="tag-row">
                  <span v-for="tag in item.tags" :key="tag" class="tag-pill"># {{ tag }}</span>
                </div>

                <div class="timeline-foot">
                  <span>{{ item.images.length }} 张图片</span>
                  <span>{{ item.shared ? '已加入分享摘要' : '未加入分享摘要' }}</span>
                </div>

                <div class="timeline-actions" @click.stop>
                  <button type="button" class="mini-icon-btn" @click="toggleHidden(item.id)">
                    {{ item.hidden ? '显示' : '隐藏' }}
                  </button>
                  <button type="button" class="mini-icon-btn" @click="toggleShared(item.id)">
                    {{ item.shared ? '取消分享' : '加入分享' }}
                  </button>
                  <button type="button" class="mini-icon-btn danger" @click="removeRecord(item.id)">
                    删除
                  </button>
                </div>
              </div>
            </button>

            <div v-if="!filteredFootprints.length" class="empty-state">
              <div class="empty-icon">⌁</div>
              <p>当前筛选条件下没有足迹记录，试试切换月份或新建一条打卡。</p>
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
import FootprintMap from '../components/FootprintMap.vue'
import { useLifeLedgerStore } from '@/stores/life-ledger'
import type { FootprintRecord } from '@/types/life-ledger'
import {
  clipText,
  copyText,
  downloadTextFile,
  formatDateTime,
  formatMonthLabel,
  monthStats,
  normalizeKeywordList,
  readFilesAsDataUrls,
  toDateInputValue,
  toMonthKey,
} from '@/utils/life-ledger'

type FootprintForm = {
  id?: string
  title: string
  description: string
  address: string
  date: string
  lat: number
  lng: number
  hidden: boolean
  shared: boolean
  images: string[]
}

const store = useLifeLedgerStore()
const toast = useToast()

const keyword = ref('')
const monthFilter = ref<'all' | string>('all')
const visibilityFilter = ref<'all' | 'visible' | 'hidden' | 'shared'>('all')
const selectedFootprintId = ref(store.footprints[0]?.id || '')
const imageInputRef = ref<HTMLInputElement>()
const tagsInput = ref('')

const footprintForm = reactive<FootprintForm>({
  id: '',
  title: '',
  description: '',
  address: '',
  date: toDateInputValue(new Date()),
  lat: 30.2741,
  lng: 120.1551,
  hidden: false,
  shared: false,
  images: [],
})

const recommendedTags = ['旅行', '散步', '城市', '夜景', '阅读', '运动', '清晨', '周末']

const visibleCount = computed(() => store.footprints.filter((item) => !item.hidden).length)
const sharedCount = computed(() => store.footprints.filter((item) => item.shared).length)

const monthSummary = computed(() =>
  monthStats(store.footprints, (item) => item.date).map((item) => ({
    ...item,
    label: formatMonthLabel(`${item.month}-01`),
  })),
)

const filteredFootprints = computed(() => {
  const search = keyword.value.trim().toLowerCase()

  return [...store.footprints]
    .filter((item) => {
      if (monthFilter.value !== 'all' && toMonthKey(item.date) !== monthFilter.value) return false
      if (visibilityFilter.value === 'visible' && item.hidden) return false
      if (visibilityFilter.value === 'hidden' && !item.hidden) return false
      if (visibilityFilter.value === 'shared' && !item.shared) return false

      if (!search) return true

      return [item.title, item.address, item.description, item.tags.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(search)
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
})

const mapPoints = computed(() =>
  filteredFootprints.value.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    lat: item.lat,
    lng: item.lng,
    hidden: item.hidden,
    address: item.address,
  })),
)

const currentFormMonthLabel = computed(() =>
  formatMonthLabel(`${footprintForm.date.slice(0, 7)}-01`),
)

const currentFormCoordText = computed(
  () => `坐标：${Number(footprintForm.lat).toFixed(4)}, ${Number(footprintForm.lng).toFixed(4)}`,
)

const shareSource = computed(() =>
  filteredFootprints.value.filter((item) =>
    visibilityFilter.value === 'shared' ? item.shared : item.shared && !item.hidden,
  ),
)

const shareSummary = computed(() => {
  const source = shareSource.value.length ? shareSource.value : filteredFootprints.value.filter((item) => !item.hidden)
  if (!source.length) {
    return '当前没有可用于分享的足迹记录。你可以先新增记录，或把某些足迹标记为“分享中”。'
  }

  const start = source[source.length - 1]
  const end = source[0]
  const topTags = [...new Set(source.flatMap((item) => item.tags))].slice(0, 6).map((item) => `#${item}`).join(' ')

  return `最近一段时间，我共记录了 ${source.length} 条足迹：从「${start.address}」到「${end.address}」，沿路写下了 ${topTags || '#生活轨迹'}。这些地点串联起旅行、散步、阅读与日常片段，也形成了一条属于自己的时间线。`
})

const selectedRecord = computed(
  () => store.footprints.find((item) => item.id === selectedFootprintId.value) || null,
)

const buildMarkdownExport = () => {
  const source = filteredFootprints.value
  const header = `# 足迹导出\n\n共导出 ${source.length} 条足迹记录。\n`
  const body = source
    .map((item, index) => {
      const tagLine = item.tags.length ? item.tags.map((tag) => `#${tag}`).join(' ') : ''
      const imageBlocks = item.images.map((src, imageIndex) => `![足迹图片 ${imageIndex + 1}](${src})`).join('\n\n')

      return `## ${index + 1}. ${item.title}
- 时间：${formatDateTime(item.date)}
- 地点：${item.address}
- 坐标：${item.lat}, ${item.lng}
- 状态：${item.hidden ? '隐藏' : '可见'} / ${item.shared ? '分享中' : '未分享'}
${tagLine ? `- 标签：${tagLine}` : ''}

${item.description || '暂无描述'}

${imageBlocks}`.trim()
    })
    .join('\n\n')

  return `${header}${body}`.trim()
}

const buildJsonExport = () =>
  JSON.stringify(
    filteredFootprints.value.map((item) => ({
      ...item,
      exportedAt: new Date().toISOString(),
    })),
    null,
    2,
  )

const loadRecord = (record?: FootprintRecord) => {
  const current =
    record ||
    store.footprints.find((item) => item.id === selectedFootprintId.value) ||
    store.createEmptyFootprint()

  selectedFootprintId.value = current.id
  footprintForm.id = current.id
  footprintForm.title = current.title
  footprintForm.description = current.description
  footprintForm.address = current.address
  footprintForm.date = toDateInputValue(current.date)
  footprintForm.lat = current.lat
  footprintForm.lng = current.lng
  footprintForm.hidden = current.hidden
  footprintForm.shared = current.shared
  footprintForm.images = [...current.images]
  tagsInput.value = current.tags.join(', ')
}

const resetForm = () => {
  footprintForm.id = ''
  footprintForm.title = ''
  footprintForm.description = ''
  footprintForm.address = ''
  footprintForm.date = toDateInputValue(new Date())
  footprintForm.lat = 30.2741
  footprintForm.lng = 120.1551
  footprintForm.hidden = false
  footprintForm.shared = false
  footprintForm.images = []
  tagsInput.value = ''
}

const appendTag = (tag: string) => {
  const tags = normalizeKeywordList(tagsInput.value)
  if (!tags.includes(tag)) tags.push(tag)
  tagsInput.value = tags.join(', ')
}

const handleMapClick = (payload: { lat: number; lng: number }) => {
  footprintForm.lat = payload.lat
  footprintForm.lng = payload.lng

  toast.add({
    severity: 'info',
    summary: '已从地图更新坐标',
    life: 1800,
  })
}

const locateCurrentPosition = () => {
  if (!navigator.geolocation) {
    toast.add({
      severity: 'warn',
      summary: '当前浏览器不支持定位',
      life: 2200,
    })
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      footprintForm.lat = Number(position.coords.latitude.toFixed(6))
      footprintForm.lng = Number(position.coords.longitude.toFixed(6))
      footprintForm.date = toDateInputValue(new Date())

      toast.add({
        severity: 'success',
        summary: '已获取当前位置，可继续补充地点名称和描述',
        life: 2200,
      })
    },
    () => {
      toast.add({
        severity: 'warn',
        summary: '定位失败，请检查定位权限后重试',
        life: 2200,
      })
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  )
}

const triggerImageInput = () => {
  imageInputRef.value?.click()
}

const handleImageChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const images = await readFilesAsDataUrls(input.files)
  footprintForm.images = [...footprintForm.images, ...images]
  input.value = ''
}

const removeImage = (index: number) => {
  footprintForm.images = footprintForm.images.filter((_, currentIndex) => currentIndex !== index)
}

const saveRecord = () => {
  if (!footprintForm.title.trim() || !footprintForm.address.trim()) {
    toast.add({
      severity: 'warn',
      summary: '请先填写足迹标题和地点名称',
      life: 2200,
    })
    return
  }

  const saved = store.upsertFootprint({
    id: footprintForm.id || undefined,
    title: footprintForm.title.trim(),
    description: footprintForm.description.trim(),
    address: footprintForm.address.trim(),
    date: new Date(footprintForm.date).toISOString(),
    lat: Number(footprintForm.lat),
    lng: Number(footprintForm.lng),
    hidden: footprintForm.hidden,
    shared: footprintForm.shared,
    tags: normalizeKeywordList(tagsInput.value),
    images: footprintForm.images,
  })

  loadRecord(saved)

  toast.add({
    severity: 'success',
    summary: '足迹记录已保存',
    life: 2200,
  })
}

const selectRecord = (id: string) => {
  const target = store.footprints.find((item) => item.id === id)
  if (!target) return
  loadRecord(target)
}

const removeRecord = (id: string) => {
  const target = store.footprints.find((item) => item.id === id)
  store.removeFootprint(id)

  if (selectedFootprintId.value === id) {
    const next = filteredFootprints.value.find((item) => item.id !== id) || store.footprints[0]
    if (next) {
      loadRecord(next)
    } else {
      resetForm()
      selectedFootprintId.value = ''
    }
  }

  toast.add({
    severity: 'success',
    summary: `已删除「${target?.title || '足迹记录'}」`,
    life: 2000,
  })
}

const removeCurrentRecord = () => {
  if (!footprintForm.id) {
    resetForm()
    return
  }
  removeRecord(footprintForm.id)
}

const toggleHidden = (id: string) => {
  store.toggleFootprintHidden(id)
  const target = store.footprints.find((item) => item.id === id)
  if (target && selectedFootprintId.value === id) loadRecord(target)
}

const toggleShared = (id: string) => {
  store.toggleFootprintShared(id)
  const target = store.footprints.find((item) => item.id === id)
  if (target && selectedFootprintId.value === id) loadRecord(target)
}

const copyShareSummary = async () => {
  await copyText(shareSummary.value)
  toast.add({
    severity: 'success',
    summary: '足迹分享摘要已复制',
    life: 2000,
  })
}

const exportJsonTracks = () => {
  downloadTextFile(`footprints-${Date.now()}.json`, buildJsonExport(), 'application/json;charset=utf-8')

  toast.add({
    severity: 'success',
    summary: 'JSON 轨迹已导出',
    life: 2000,
  })
}

const exportMarkdownTracks = () => {
  downloadTextFile(`footprints-${Date.now()}.md`, buildMarkdownExport(), 'text/markdown;charset=utf-8')

  toast.add({
    severity: 'success',
    summary: 'Markdown 轨迹已导出',
    life: 2000,
  })
}

watch(
  () => filteredFootprints.value,
  (list) => {
    if (!list.length) return
    if (!selectedFootprintId.value || !list.some((item) => item.id === selectedFootprintId.value)) {
      loadRecord(list[0])
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.footprint-page-grid {
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr);
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
.share-panel,
.summary-panel,
.timeline-panel {
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

.editor-actions,
.share-actions,
.badge-stack,
.timeline-actions,
.tag-row,
.switch-row,
.switch-group,
.option-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.helper-card {
  margin-top: 16px;
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
  min-height: 118px;
  padding: 12px 14px;
  resize: vertical;
  line-height: 1.75;
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
.tag-chip-btn,
.month-card,
.timeline-item,
.mini-icon-btn {
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
.tag-chip-btn:hover,
.month-card:hover,
.timeline-item:hover,
.mini-icon-btn:hover {
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
.tag-chip-btn,
.month-card,
.timeline-item,
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

.option-btn.active {
  color: var(--color-primary-text);
  border-color: var(--color-primary-border);
  background: var(--color-primary-bg);
}

.meta-hint {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.tag-suggestion {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip-btn,
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
.tag-pill,
.tag-chip-btn {
  background: var(--color-tag);
  border: 1px solid var(--color-border);
  color: var(--color-pill-text);
}

.tiny-badge.primary {
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-border);
  color: var(--color-primary-text);
}

.tiny-badge.hidden {
  background: rgba(226, 232, 240, 0.88);
  border: 1px solid rgba(203, 213, 225, 0.9);
  color: #475569;
}

.tiny-badge.shared {
  background: rgba(167, 243, 208, 0.3);
  border: 1px solid rgba(167, 243, 208, 0.36);
  color: #047857;
}

.image-panel,
.glass-sub {
  margin-top: 18px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid var(--color-border);
}

.image-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.image-head strong {
  font-size: 15px;
  color: var(--color-text-main);
}

.image-head span {
  font-size: 12px;
  color: var(--color-text-muted);
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

.share-card {
  margin-top: 16px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(125, 211, 252, 0.22);
  background:
    linear-gradient(135deg, rgba(224, 242, 254, 0.92), rgba(255, 255, 255, 0.78)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.18), transparent 34%);
}

.share-top {
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
}

.share-card p {
  margin: 14px 0 0;
  color: var(--color-text-muted);
  line-height: 1.85;
  font-size: 14px;
}

.share-actions {
  margin-top: 16px;
}

.month-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.month-card {
  min-height: 128px;
  padding: 16px;
  border-radius: 18px;
  text-align: left;
}

.month-card.active {
  border-color: var(--color-primary-border);
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.92), rgba(255, 255, 255, 0.82));
}

.month-label {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  color: var(--color-pill-text);
  font-size: 12px;
  font-weight: 700;
}

.month-card strong {
  display: block;
  margin-top: 10px;
  font-size: 30px;
  line-height: 1.1;
  color: var(--color-text-main);
}

.month-card em {
  display: block;
  margin-top: 8px;
  font-style: normal;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.7;
}

.timeline-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.timeline-item {
  width: 100%;
  text-align: left;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 14px;
  padding: 16px;
  border-radius: 22px;
}

.timeline-item.active {
  border-color: var(--color-primary-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(240, 249, 255, 0.9));
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}

.timeline-item.hidden {
  opacity: 0.84;
}

.timeline-marker {
  display: flex;
  justify-content: center;
  position: relative;
}

.timeline-marker::before {
  content: '';
  position: absolute;
  top: 4px;
  bottom: -18px;
  width: 2px;
  background: rgba(148, 163, 184, 0.24);
}

.timeline-item:last-child .timeline-marker::before {
  display: none;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 0 5px rgba(56, 189, 248, 0.12);
  margin-top: 6px;
  z-index: 1;
}

.timeline-body {
  min-width: 0;
}

.timeline-top,
.timeline-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.coord-text,
.address-line,
.timeline-foot {
  color: var(--color-text-muted);
  font-size: 12px;
}

.timeline-body h4 {
  margin: 12px 0 6px;
  font-size: 18px;
  line-height: 1.45;
  color: var(--color-text-main);
}

.address-line {
  font-weight: 700;
}

.timeline-body p {
  margin: 10px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.8;
}

.tag-row {
  margin-top: 14px;
}

.timeline-foot {
  margin-top: 14px;
}

.timeline-actions {
  margin-top: 14px;
}

.mini-icon-btn {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.empty-inline,
.empty-state {
  color: var(--color-text-muted);
  font-size: 13px;
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
  .month-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1180px) {
  .footprint-page-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .form-grid,
  .image-grid,
  .month-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }

  .meta-hint {
    margin-left: 0;
    min-width: 0;
  }
}

@media (max-width: 640px) {
  .editor-panel,
  .share-panel,
  .summary-panel,
  .timeline-panel {
    padding: 14px;
  }

  .section-head,
  .image-head,
  .share-actions,
  .timeline-actions,
  .editor-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-btn,
  .mini-btn {
    width: 100%;
  }

  .timeline-item {
    grid-template-columns: 1fr;
  }

  .timeline-marker {
    display: none;
  }
}
</style>

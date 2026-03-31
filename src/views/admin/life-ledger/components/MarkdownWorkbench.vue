<template>
  <div class="markdown-workbench glass-panel">
    <div class="workbench-head">
      <div class="head-copy">
        <h3 class="head-title">{{ title }}</h3>
        <p v-if="description" class="head-desc">{{ description }}</p>
      </div>

      <div class="head-actions">
        <button type="button" class="head-btn" :class="{ active: showPreview }" @click="showPreview = !showPreview">
          {{ showPreview ? '隐藏预览' : '显示预览' }}
        </button>
        <button type="button" class="head-btn" @click="copyMarkdown">复制 Markdown</button>
      </div>
    </div>

    <div class="toolbar">
      <button type="button" class="tool-btn" @click="wrapSelection('**', '**', '加粗文本')">加粗</button>
      <button type="button" class="tool-btn" @click="wrapSelection('*', '*', '斜体文本')">斜体</button>
      <button type="button" class="tool-btn" @click="prependLine('# ')">标题</button>
      <button type="button" class="tool-btn" @click="prependLine('> ')">引用</button>
      <button type="button" class="tool-btn" @click="prependLine('- ')">无序列表</button>
      <button type="button" class="tool-btn" @click="prependLine('- [ ] ')">待办清单</button>
      <button type="button" class="tool-btn" @click="wrapSelection('`', '`', '代码')">行内代码</button>
      <button type="button" class="tool-btn" @click="insertCodeBlock">代码块</button>
      <button type="button" class="tool-btn" @click="insertLink">插入链接</button>
      <button type="button" class="tool-btn" @click="insertImageByUrl">图片链接</button>
      <button type="button" class="tool-btn" @click="pickLocalImages">上传图片</button>
      <button type="button" class="tool-btn" @click="formatDocument">排版整理</button>

      <input ref="fileInputRef" type="file" accept="image/*" multiple class="hidden-input" @change="onFileChange" />
    </div>

    <div class="editor-layout" :class="{ single: !showPreview }">
      <div class="editor-panel">
        <div class="panel-title">编辑区</div>
        <textarea
          ref="textareaRef"
          class="editor-area"
          :value="modelValue"
          :placeholder="placeholder"
          :style="{ minHeight: normalizedHeight }"
          @input="handleInput"
        />
        <div class="editor-footer">
          <span>{{ plainLength }} 字</span>
          <span v-if="helperText">{{ helperText }}</span>
        </div>
      </div>

      <div v-if="showPreview" class="preview-panel">
        <div class="panel-title">实时预览</div>
        <div v-if="modelValue.trim()" class="preview-body markdown-body" v-html="previewHtml" />
        <div v-else class="preview-empty">
          <div class="empty-icon">✦</div>
          <p>开始写点什么吧，右侧会实时生成排版预览。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import {
  copyText,
  extractPlainText,
  readFilesAsDataUrls,
  renderMarkdown,
} from '@/utils/life-ledger'

const props = withDefaults(
  defineProps<{
    modelValue: string
    title?: string
    description?: string
    placeholder?: string
    helperText?: string
    minHeight?: string | number
  }>(),
  {
    title: 'Markdown 编辑器',
    description: '',
    placeholder: '在这里输入 Markdown 内容...',
    helperText: '',
    minHeight: 360,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const fileInputRef = ref<HTMLInputElement>()
const showPreview = ref(true)

const normalizedHeight = computed(() =>
  typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight,
)

const previewHtml = computed(() => renderMarkdown(props.modelValue))
const plainLength = computed(() => extractPlainText(props.modelValue).length)

const updateValue = (value: string) => {
  emit('update:modelValue', value)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  updateValue(target.value)
}

const restoreSelection = async (start: number, end: number) => {
  await nextTick()
  textareaRef.value?.focus()
  textareaRef.value?.setSelectionRange(start, end)
}

const replaceSelection = async (
  build: (selected: string, start: number, end: number) => {
    value: string
    selectionStart: number
    selectionEnd: number
  },
) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const source = props.modelValue
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = source.slice(start, end)
  const result = build(selected, start, end)

  updateValue(result.value)
  await restoreSelection(result.selectionStart, result.selectionEnd)
}

const wrapSelection = async (prefix: string, suffix = '', fallback = '内容') => {
  await replaceSelection((selected, start, end) => {
    const current = selected || fallback
    const next =
      props.modelValue.slice(0, start) +
      prefix +
      current +
      suffix +
      props.modelValue.slice(end)

    const selectionStart = start + prefix.length
    const selectionEnd = selectionStart + current.length

    return {
      value: next,
      selectionStart,
      selectionEnd,
    }
  })
}

const prependLine = async (linePrefix: string) => {
  await replaceSelection((selected, start, end) => {
    const current = selected || '内容'
    const next =
      props.modelValue.slice(0, start) +
      linePrefix +
      current +
      props.modelValue.slice(end)

    return {
      value: next,
      selectionStart: start + linePrefix.length,
      selectionEnd: start + linePrefix.length + current.length,
    }
  })
}

const insertCodeBlock = async () => {
  await replaceSelection((selected, start, end) => {
    const current = selected || 'const idea = "记录当下"'
    const block = `\n\`\`\`ts\n${current}\n\`\`\`\n`
    const next = props.modelValue.slice(0, start) + block + props.modelValue.slice(end)
    const selectionStart = start + 7
    const selectionEnd = selectionStart + current.length

    return {
      value: next,
      selectionStart,
      selectionEnd,
    }
  })
}

const insertLink = async () => {
  const url = window.prompt('请输入链接地址', 'https://')
  if (!url) return

  await replaceSelection((selected, start, end) => {
    const label = selected || '链接标题'
    const block = `[${label}](${url})`
    const next = props.modelValue.slice(0, start) + block + props.modelValue.slice(end)

    return {
      value: next,
      selectionStart: start + 1,
      selectionEnd: start + 1 + label.length,
    }
  })
}

const insertImageByUrl = async () => {
  const url = window.prompt('请输入图片地址', 'https://example.com/image.png')
  if (!url) return

  const alt = window.prompt('请输入图片描述', '图片描述') || '图片描述'

  await replaceSelection((_, start, end) => {
    const block = `![${alt}](${url})`
    const next = props.modelValue.slice(0, start) + block + props.modelValue.slice(end)

    return {
      value: next,
      selectionStart: start + 2,
      selectionEnd: start + 2 + alt.length,
    }
  })
}

const pickLocalImages = () => {
  fileInputRef.value?.click()
}

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const urls = await readFilesAsDataUrls(input.files)
  const blocks = urls.map((url, index) => `![本地图片 ${index + 1}](${url})`).join('\n\n')

  await replaceSelection((_, start, end) => {
    const prefix = props.modelValue && !props.modelValue.endsWith('\n') ? '\n\n' : ''
    const next = props.modelValue.slice(0, start) + prefix + blocks + props.modelValue.slice(end)
    const selectionStart = start + prefix.length
    const selectionEnd = selectionStart + blocks.length

    return {
      value: next,
      selectionStart,
      selectionEnd,
    }
  })

  input.value = ''
}

const formatDocument = () => {
  const formatted = props.modelValue
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  updateValue(formatted)
}

const copyMarkdown = async () => {
  await copyText(props.modelValue)
}
</script>

<style scoped lang="scss">
.markdown-workbench {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.workbench-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.head-copy {
  min-width: 0;
}

.head-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
}

.head-desc {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--color-text-muted);
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.head-btn,
.tool-btn {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.68);
  color: var(--color-text-main);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.head-btn:hover,
.tool-btn:hover,
.head-btn.active {
  background: var(--color-primary-bg);
  color: var(--color-primary-text);
  border-color: var(--color-primary-border);
  transform: translateY(-1px);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px;
  border-radius: 14px;
  background: var(--color-strip);
  border: 1px solid var(--color-border);
}

.hidden-input {
  display: none;
}

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 16px;
  min-height: 0;
}

.editor-layout.single {
  grid-template-columns: 1fr;
}

.editor-panel,
.preview-panel {
  min-width: 0;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.56);
  display: flex;
  flex-direction: column;
}

.panel-title {
  min-height: 46px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-main);
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.5);
}

.editor-area {
  width: 100%;
  border: none;
  resize: vertical;
  padding: 18px;
  background: transparent;
  color: var(--color-text-main);
  font-size: 14px;
  line-height: 1.8;
  outline: none;
  font-family:
    'SFMono-Regular',
    'SF Mono',
    Consolas,
    'Liberation Mono',
    Menlo,
    monospace;
}

.editor-area::placeholder {
  color: var(--color-text-muted);
}

.editor-footer {
  min-height: 42px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--color-text-muted);
  font-size: 12px;
  border-top: 1px solid var(--color-border);
}

.preview-body {
  padding: 18px;
  overflow: auto;
  color: var(--color-text-main);
  line-height: 1.85;
}

.preview-empty {
  flex: 1;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  color: var(--color-text-muted);
  text-align: center;
  padding: 20px;
}

.empty-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--color-primary-bg);
  color: var(--color-primary-text);
  font-weight: 700;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  margin: 1.2em 0 0.6em;
  color: var(--color-text-main);
  line-height: 1.35;
}

.markdown-body :deep(p) {
  margin: 0.8em 0;
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
  margin: 1em 0;
  padding: 10px 14px;
  border-left: 3px solid var(--color-primary-solid);
  background: var(--color-primary-bg);
  color: var(--color-text-muted);
  border-radius: 0 12px 12px 0;
}

.markdown-body :deep(code) {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--color-tag);
  font-size: 0.92em;
}

.markdown-body :deep(pre) {
  padding: 14px;
  border-radius: 14px;
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
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1.5em 0;
}

@media (max-width: 1024px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .markdown-workbench {
    padding: 14px;
  }

  .workbench-head {
    flex-direction: column;
  }

  .head-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .toolbar {
    padding: 10px;
  }

  .editor-footer {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 10px 16px;
  }
}
</style>

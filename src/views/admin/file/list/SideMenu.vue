<template>
  <aside class="drive-sidebar px-20 py-25">
    <div class="sidebar-head">
      <button class="btn-upload" type="button">
        <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
          <path
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
          />
        </svg>
        上传文件
      </button>
      <button class="btn-new-folder" type="button">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        新建文件夹
      </button>
    </div>

    <nav class="sidebar-nav">
      <button
        v-for="nav in navItems"
        :key="nav.key"
        class="nav-item"
        :class="{ active: typeFilter === nav.key }"
        type="button"
        @click="typeFilter = nav.key"
      >
        <span class="nav-icon" v-html="nav.icon" />
        <span class="nav-label">{{ nav.label }}</span>
        <span class="nav-count">{{ nav.count }}</span>
      </button>
    </nav>

    <div class="storage-block">
      <div class="storage-header">
        <span class="storage-title">存储空间</span>
        <span class="storage-nums">1.92 TB / 5 TB</span>
      </div>
      <div class="storage-bar">
        <div class="storage-fill" style="width: 38.4%" />
      </div>
      <p class="storage-hint">已使用 38.4%，剩余 3.08 TB</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useFileListStore } from './store'

const fileListStore = useFileListStore()
const { typeFilter, files } = storeToRefs(fileListStore)

const navItems = computed(() => [
  {
    key: 'all' as const,
    label: '全部文件',
    count: files.value.length,
    icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>`,
  },
  {
    key: 'image' as const,
    label: '图片',
    count: files.value.filter((f) => f.type === 'image').length,
    icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg>`,
  },
  {
    key: 'video' as const,
    label: '视频',
    count: files.value.filter((f) => f.type === 'video').length,
    icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>`,
  },
  {
    key: 'document' as const,
    label: '文档',
    count: files.value.filter((f) => f.type === 'document').length,
    icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>`,
  },
  {
    key: 'archive' as const,
    label: '压缩包',
    count: files.value.filter((f) => f.type === 'archive').length,
    icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 14a2 2 0 002 2h8a2 2 0 002-2v-4H4v4z"/></svg>`,
  },
])
</script>

<style lang="scss" scoped>
.drive-sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-panel);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow-y: auto;
}

.sidebar-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.btn-upload {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 9px 16px;
  background: var(--color-btn-bg);
  color: var(--color-btn-text);
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition:
    background 0.18s,
    transform 0.12s;

  &:hover {
    background: var(--color-btn-hover);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-new-folder {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-main);
  cursor: pointer;
  transition:
    background 0.18s,
    border-color 0.18s,
    color 0.18s;

  &:hover {
    background: var(--color-primary-bg);
    border-color: var(--color-primary-border);
    color: var(--color-primary-text);
  }
}

.storage-block {
  margin-top: 20px;
  padding: 13px 12px 12px;
  background: var(--color-tag);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.storage-title {
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.storage-nums {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-main);
}

.storage-bar {
  height: 5px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-solid), #38bdf8);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.storage-hint {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.storage-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 9px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-item {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  .nav-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    opacity: 0.65;
    transition: opacity 0.15s;
  }

  .nav-label {
    flex: 1;
    line-height: 1;
  }

  .nav-count {
    flex-shrink: 0;
    min-width: 20px;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 20px;
    background: var(--color-tag);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;
  }

  &:hover {
    background: var(--color-tag);
    color: var(--color-text-main);

    .nav-icon {
      opacity: 1;
    }
  }

  &.active {
    background: var(--color-primary-bg);
    color: var(--color-primary-text);
    font-weight: 600;

    .nav-icon {
      opacity: 1;
    }

    .nav-count {
      background: var(--color-primary-border);
      border-color: transparent;
      color: var(--color-primary-text);
    }
  }
}
</style>

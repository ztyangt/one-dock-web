<template>
  <div class="drive-toolbar">
    <div class="breadcrumb">
      <button type="button" class="bc-btn">首页</button>
      <svg class="bc-sep" viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      <button type="button" class="bc-btn">assets</button>
      <svg class="bc-sep" viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="bc-current">banner</span>
    </div>

    <div class="toolbar-right">
      <div class="search-box">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path
            fill-rule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clip-rule="evenodd"
          />
        </svg>
        <input v-model="keyword" type="text" placeholder="搜索文件名、路径、存储桶..." />
      </div>

      <select v-model="sortBy" class="sort-select">
        <option value="updatedAt">最近更新</option>
        <option value="size">文件大小</option>
        <option value="downloads">下载次数</option>
        <option value="name">文件名称</option>
      </select>

      <div class="view-toggle">
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: viewMode === 'grid' }"
          title="网格视图"
          @click="viewMode = 'grid'"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path
              d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: viewMode === 'list' }"
          title="列表视图"
          @click="viewMode = 'list'"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFileListStore } from './store'

const fileListStore = useFileListStore()
const { keyword, sortBy, viewMode } = storeToRefs(fileListStore)
</script>

<style lang="scss" scoped>
.drive-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 20px;
  background: var(--color-panel);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 2px;
}

.bc-btn {
  all: unset;
  font-size: 13px;
  color: var(--color-text-muted);
  padding: 3px 6px;
  border-radius: 5px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: var(--color-primary-bg);
    color: var(--color-primary-text);
  }
}

.bc-sep {
  color: var(--color-text-muted);
  opacity: 0.35;
  flex-shrink: 0;
}

.bc-current {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-main);
  padding: 3px 6px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: border-color 0.15s;

  &:focus-within {
    border-color: var(--color-primary-border);
  }

  svg {
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  input {
    all: unset;
    width: 190px;
    font-size: 13px;
    color: var(--color-text-main);

    &::placeholder {
      color: var(--color-text-muted);
    }
  }
}

.sort-select {
  appearance: none;
  padding: 6px 28px 6px 10px;
  background-color: var(--color-input-bg);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-text-main);
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--color-primary-border);
  }
}

.view-toggle {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.toggle-btn {
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  & + .toggle-btn {
    border-left: 1px solid var(--color-border);
  }

  &:hover {
    background: var(--color-tag);
    color: var(--color-text-main);
  }

  &.active {
    background: var(--color-primary-bg);
    color: var(--color-primary-text);
  }
}
</style>

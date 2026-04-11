<template>
  <transition name="batch-slide">
    <div v-if="selectedIds.length > 0" class="batch-bar br-8">
      <span class="batch-count"
        >已选 <strong>{{ selectedIds.length }}</strong> 项</span
      >
      <div class="batch-actions">
        <button type="button" class="batch-btn">
          <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
            <path
              fill-rule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          下载
        </button>
        <button type="button" class="batch-btn">
          <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          移动
        </button>
        <button type="button" class="batch-btn danger">
          <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          删除
        </button>
        <button type="button" class="batch-btn cancel" @click="selectedIds = []">取消</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useFileListStore } from './store'

const fileListStore = useFileListStore()
const { selectedIds } = storeToRefs(fileListStore)
</script>

<style lang="scss" scoped>
.batch-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 9px 20px;
  margin-top: 15px;
  background: var(--color-panel);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-panel);
  overflow: hidden;
}

.batch-count {
  font-size: 13px;
  color: var(--color-text-main);

  strong {
    font-weight: 700;
    color: var(--color-primary-solid);
  }
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.batch-btn {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 13px;
  background: var(--color-tag);
  border: 1px solid transparent;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-main);
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;

  &:hover {
    background: var(--color-primary-bg);
    color: var(--color-primary-text);
  }

  &.danger {
    color: #ef4444;
    &:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  }

  &.cancel {
    color: var(--color-text-muted);
    &:hover {
      background: var(--color-border);
      color: var(--color-text-main);
    }
  }
}

// Transition
.batch-slide-enter-active,
.batch-slide-leave-active {
  transition:
    max-height 0.22s ease,
    opacity 0.22s ease,
    margin-top 0.22s ease,
    padding-top 0.22s ease,
    padding-bottom 0.22s ease,
    box-shadow 0.22s ease;
  max-height: 56px;
  overflow: hidden;
}

.batch-slide-enter-from,
.batch-slide-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
  box-shadow: none;
}
</style>

<template>
  <div class="drive-content p-15 br-8">
    <template v-if="viewMode === 'grid'">
      <div v-if="filteredFiles.length > 0" class="file-grid">
        <div
          v-for="file in filteredFiles"
          :key="file.id"
          class="file-card"
          :class="{ selected: selectedIds.includes(file.id) }"
          v-ripple
        >
          <label class="card-check" @click.stop>
            <input
              type="checkbox"
              :checked="selectedIds.includes(file.id)"
              @change="toggleSelect(file.id)"
            />
            <span class="check-mark" />
          </label>

          <div class="card-icon" :class="file.type">
            <span class="ext-label">{{ file.extension }}</span>
          </div>

          <p class="card-name" :title="file.name">{{ file.name }}</p>
          <p class="card-meta">{{ file.size }}&nbsp;·&nbsp;{{ file.updatedAt.slice(0, 10) }}</p>

          <div class="card-hover-actions">
            <button type="button" title="预览">
              <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fill-rule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <button type="button" title="复制链接">
              <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                <path
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                />
              </svg>
            </button>
            <button type="button" class="del" title="删除">
              <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 20 20" fill="currentColor" width="36" height="36">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        </div>
        <p class="empty-text">未找到匹配的文件</p>
        <p class="empty-sub">请尝试修改筛选条件或搜索关键词</p>
      </div>
    </template>

    <!-- ── List view ── -->
    <template v-else>
      <div v-if="filteredFiles.length > 0" class="file-list-wrap">
        <table class="list-table">
          <thead>
            <tr>
              <th class="col-check">
                <label class="tbl-check">
                  <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
                  <span class="check-mark" />
                </label>
              </th>
              <th class="col-name">文件名</th>
              <th class="col-size">大小</th>
              <th class="col-strategy">存储策略</th>
              <th class="col-status">状态</th>
              <th class="col-date">更新时间</th>
              <th class="col-ops">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="file in filteredFiles"
              :key="file.id"
              :class="{ selected: selectedIds.includes(file.id) }"
            >
              <td class="col-check">
                <label class="tbl-check">
                  <input
                    type="checkbox"
                    :checked="selectedIds.includes(file.id)"
                    @change="toggleSelect(file.id)"
                  />
                  <span class="check-mark" />
                </label>
              </td>

              <td class="col-name">
                <div class="row-name-cell">
                  <div class="row-icon" :class="file.type">
                    <span>{{ file.extension }}</span>
                  </div>
                  <div class="row-name-info">
                    <p class="row-filename" :title="file.name">{{ file.name }}</p>
                    <p class="row-filepath" :title="file.path">{{ file.path }}</p>
                  </div>
                </div>
              </td>

              <td class="col-size">{{ file.size }}</td>
              <td class="col-strategy">{{ file.strategy }}</td>

              <td class="col-status">
                <span class="status-badge" :class="statusClassMap[file.status]">
                  {{ file.status }}
                </span>
              </td>

              <td class="col-date">{{ file.updatedAt }}</td>

              <td class="col-ops">
                <div class="row-actions">
                  <button type="button" title="预览">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fill-rule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <button type="button" title="复制链接">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                      <path
                        d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                      />
                    </svg>
                  </button>
                  <button type="button" class="del" title="删除">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                      <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 20 20" fill="currentColor" width="36" height="36">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        </div>
        <p class="empty-text">未找到匹配的文件</p>
        <p class="empty-sub">请尝试修改筛选条件或搜索关键词</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useFileListStore } from './store'

const fileListStore = useFileListStore()
const { toggleSelect, toggleSelectAll, statusClassMap } = fileListStore
const {
  filteredFiles,
  viewMode,
  keyword,
  typeFilter,
  strategyFilter,
  statusFilter,
  sortBy,
  activeTag,
  selectedIds,
  isAllSelected,
} = storeToRefs(fileListStore)
</script>

<style lang="scss" scoped>
.drive-content {
  flex: 1;
  overflow-y: auto;
  background: var(--color-panel);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-panel);
}

.check-mark {
  display: block;
  width: 17px;
  height: 17px;
  border-radius: 5px;
  border: 2px solid var(--color-border);
  background: var(--color-logo-bg);
  position: relative;
  pointer-events: none;
  flex-shrink: 0;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.card-check {
  position: absolute;
  top: 9px;
  left: 9px;
  z-index: 2;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  display: flex;

  input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  input:checked + .check-mark {
    background: var(--color-primary-solid);
    border-color: var(--color-primary-solid);

    &::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 5px;
      height: 9px;
      border: 2px solid #fff;
      border-top: none;
      border-left: none;
      transform: rotate(45deg);
    }
  }
}

.tbl-check {
  display: inline-flex;
  cursor: pointer;

  input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  input:checked + .check-mark {
    background: var(--color-primary-solid);
    border-color: var(--color-primary-solid);

    &::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 5px;
      height: 9px;
      border: 2px solid #fff;
      border-top: none;
      border-left: none;
      transform: rotate(45deg);
    }
  }
}

%type-icon-base {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;

  &.image {
    background: #0ea5e9;
  }
  &.video {
    background: #8b5cf6;
  }
  &.document {
    background: #10b981;
  }
  &.archive {
    background: #f59e0b;
  }
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.file-card {
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 12px 14px;
  background: var(--color-logo-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition:
    border-color 0.18s,
    background 0.18s,
    box-shadow 0.18s;

  &:hover {
    border-color: var(--color-primary-solid);
    background: var(--color-tag);
    box-shadow: var(--shadow-pill-hover);

    .card-check {
      opacity: 1;
    }
    .card-hover-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &.selected {
    border-color: var(--color-primary-solid);
    background: var(--color-primary-bg);

    .card-check {
      opacity: 1;
    }
  }
}

.card-icon {
  @extend %type-icon-base;
  width: 52px;
  height: 52px;
  margin-bottom: 2px;

  .ext-label {
    font-size: 10px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.04em;
  }
}

.card-name {
  width: 100%;
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-main);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}

.card-meta {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: center;
  line-height: 1.4;
}

.card-hover-actions {
  display: flex;
  gap: 5px;
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity 0.15s,
    transform 0.15s;

  button {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: var(--color-logo-bg);
    border: 1px solid transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;

    &:hover {
      background: var(--color-primary-bg);
      color: var(--color-primary-text);
    }

    &.del:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }
}

.file-list-wrap {
  background: var(--color-logo-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.list-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  thead tr {
    border-bottom: 1px solid var(--color-border);

    th {
      padding: 12px 14px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-muted);
      text-align: left;
      background: var(--color-tag);
      white-space: nowrap;
      letter-spacing: 0.01em;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid var(--color-border);
      transition: background 0.15s;

      &:last-child {
        border-bottom: none;
      }

      td {
        padding: 12px 14px;
        font-size: 13px;
        color: var(--color-text-main);
        vertical-align: middle;
      }

      &:hover {
        background: var(--color-tag);

        .row-actions {
          opacity: 1;
        }
      }

      &.selected {
        background: var(--color-primary-bg);
      }
    }
  }
}

.col-check {
  width: 44px;
}
.col-size {
  width: 88px;
  white-space: nowrap;
}
.col-strategy {
  width: 130px;
  font-size: 12px !important;
  color: var(--color-text-muted) !important;
}
.col-status {
  width: 92px;
}
.col-date {
  width: 148px;
  white-space: nowrap;
  font-size: 12px !important;
  color: var(--color-text-muted) !important;
}
.col-ops {
  width: 96px;
}

.row-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.row-icon {
  @extend %type-icon-base;
  width: 34px;
  height: 34px;
  border-radius: 7px;

  span {
    font-size: 8px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.03em;
  }
}

.row-name-info {
  flex: 1;
  min-width: 0;
}

.row-filename {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.row-filepath {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.row-actions {
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.15s;

  button {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: var(--color-logo-bg);
    border: 1px solid transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;

    &:hover {
      background: var(--color-primary-bg);
      color: var(--color-primary-text);
    }

    &.del:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;

  &.success {
    background: rgba(16, 185, 129, 0.1);
    color: var(--color-success);
  }

  &.warning {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &.neutral {
    background: var(--color-tag);
    color: var(--color-text-muted);
  }

  &.info {
    background: var(--color-primary-bg);
    color: var(--color-primary-text);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: var(--color-tag);
  border: 1px solid transparent;
  color: var(--color-text-muted);
  opacity: 0.8;
  margin-bottom: 16px;
}

.empty-text {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-main);
}

.empty-sub {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>

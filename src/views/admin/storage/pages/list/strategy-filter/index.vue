<template>
  <div class="strategy-filter-wrap">
    <a-select
      class="card-bg"
      :style="{ width: '160px' }"
      placeholder="选择策略"
      allowClear
      style="--color-neutral-2: var(--card-bg)"
      :trigger-props="{ autoFitPopupMinWidth: true }"
      @change="handleChange"
    >
      <a-option v-for="item in strategyList" :key="item.id" :value="item.id">
        <div class="flex-yc">
          <img
            :src="strategyMap[item.type].icon"
            class="mr-5 strategy-filter-strategy-icon flex-shrink-0"
          />
          <span>{{ item.name }}</span>
        </div>
      </a-option>
    </a-select>
  </div>
</template>

<script setup lang="ts">
import { useStorageStore } from '@/stores/storage'
import { useFileListStore } from '../../../stores/file-list'

const store = useStorageStore()
const { strategyMap } = store
const { strategyList } = storeToRefs(store)

const fileListStore = useFileListStore()
const { getFileList } = fileListStore
const { strategyId } = storeToRefs(fileListStore)

const route = useRoute()
const handleChange = (value: number) => {
  strategyId.value = value || undefined
  getFileList(route.query.folder as string)
}
</script>

<style lang="scss">
.strategy-filter-strategy-icon {
  width: 18px;
  height: 18px;
}
</style>

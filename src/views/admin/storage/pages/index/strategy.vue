<template>
  <div v-if="currentStrategy">
    <a-dropdown position="bl" @select="handleSelect" trigger="hover">
      <div class="fw-500 muted-color fs-12 mb-10 pointer flex-yc">
        <c-icon name="server-line" class="mr-5" />
        <span class="mr-5">存储策略</span>
        <icon-down />
      </div>
      <template #icon>
        <icon-down />
      </template>
      <template #content>
        <a-doption v-for="item in strategyList" :key="item.id" :value="`${item.id}`">
          {{ item.name }}
        </a-doption>
      </template>
    </a-dropdown>

    <div class="strategy-card br-5 p-15 border secondary-bg" style="width: 200px">
      <div class="flex-yc">
        <div class="strategy-icon mr-5 flex-shrink-0">
          <img
            :src="storageStore.strategyMap[currentStrategy?.type || StrategyEnumType.LOCAL].icon"
          />
        </div>
        <div class="fw-500 fs-14">{{ currentStrategy?.name || '本地存储' }}</div>
      </div>

      <div class="fs-12 muted-color mt-5">
        <div>
          {{ storageStore.strategyMap[currentStrategy?.type || StrategyEnumType.LOCAL].title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStorageStore } from '@/stores/storage'
import { useConfigStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { StrategyEnumType } from '@/data/enum/file'

const storageStore = useStorageStore()
const { strategyList, currentStrategy } = storeToRefs(storageStore)

const configStore = useConfigStore()

const handleSelect = (value: string) => {
  configStore.updateConfig({ currentStrategyId: Number(value) })
}
</script>

<style lang="scss" scoped>
.strategy-icon {
  img {
    width: 24px;
    height: 24px;
  }
}
</style>

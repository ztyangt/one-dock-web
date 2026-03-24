<template>
  <div class="file-path-bread-crumb card-bg p-5 br-5">
    <a-breadcrumb>
      <template #separator>
        <icon-right />
      </template>
      <a-breadcrumb-item
        class="pointer flex-yc theme-hover"
        @click="router.push({ name: 'storage-recycle' })"
      >
        <c-icon name="delete-bin-3-line" class="mr-5" /> 回收站
      </a-breadcrumb-item>

      <a-breadcrumb-item
        v-for="(item, index) in folder?.parents || []"
        :key="index"
        class="pointer theme-hover"
        @click="router.push({ query: { folder: item.id } })"
      >
        {{ item.name }}
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { useRecycleStore } from '../../../stores/file-recycle'

const router = useRouter()

const { folder } = storeToRefs(useRecycleStore())
</script>

<style lang="scss">
.file-path-bread-crumb {
  overflow: auto;
  .arco-breadcrumb-item {
    white-space: nowrap;
  }
}
</style>

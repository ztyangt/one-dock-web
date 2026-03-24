<template>
  <div class="file-path-bread-crumb card-bg p-5 br-3">
    <a-breadcrumb>
      <template #separator>
        <icon-right />
      </template>
      <a-breadcrumb-item
        class="pointer flex-yc theme-hover"
        @click="router.push({ name: 'storage-list' })"
      >
        <c-icon name="home-5-line" class="mr-5" /> 根目录
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
import { useFileListStore } from '../../../stores/file-list'

const router = useRouter()

const { folder } = storeToRefs(useFileListStore())
</script>

<style lang="scss">
.file-path-bread-crumb {
  overflow: auto;
  .arco-breadcrumb-item {
    white-space: nowrap;
  }
}
</style>

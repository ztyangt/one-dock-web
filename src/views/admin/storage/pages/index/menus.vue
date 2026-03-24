<template>
  <div class="file-menus flex-shrink-0">
    <router-link
      v-for="item in menuList"
      :key="item.name"
      :to="{ name: item.name }"
      :class="{ active: route.name === item.name }"
      v-ripple
      class="file-menu text-color hover-weight py-10 mb-5 px-15 br-5"
    >
      <div class="flex-yc">
        <c-icon :name="item.icon" color="var(--text-color)" class="mr-10"></c-icon>
        <a-badge
          :count="uploadingList.length"
          :offset="[15, 0]"
          v-if="item.name === 'storage-transfer'"
        >
          <div>{{ item.title }}</div>
        </a-badge>
        <div v-else>{{ item.title }}</div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useFileUploadStore } from '../../stores/file-upload'

const route = useRoute()
const fileUploadStore = useFileUploadStore()
const { uploadingList } = storeToRefs(fileUploadStore)

const menuList = [
  { title: '存储概览', name: 'storage-overview', icon: 'file-chart-line' },
  { title: '文件管理', name: 'storage-list', icon: 'file-list-2-line' },
  { title: '存储策略', name: 'storage-strategy', icon: 'upload-cloud-line' },
  { title: '传输任务', name: 'storage-transfer', icon: 'file-upload-line' },
  { title: '回收站', name: 'storage-recycle', icon: 'delete-bin-4-line' }
]
</script>

<style lang="scss" scoped>
.file-menu {
  display: block;
  cursor: pointer;
  text-decoration: none;

  &.active {
    background-color: var(--secondary-bg);
    color: var(--weight-color);
    font-weight: 500;
    i {
      color: var(--weight-color) !important;
    }
  }
}
</style>

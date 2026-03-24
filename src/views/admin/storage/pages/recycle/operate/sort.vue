<template>
  <a-dropdown position="bl" @select="handleSelect" trigger="hover">
    <a-button class="card-bg">
      <icon-sort />
      <span class="ml-5">排序</span>
    </a-button>
    <template #content>
      <a-dsubmenu v-for="item in sortOptions" :key="item.value" :value="item.value" trigger="hover">
        <template #default>{{ item.label }}</template>
        <template #content>
          <a-doption :value="`${item.value} asc`">升序</a-doption>
          <a-doption :value="`${item.value} desc`">降序</a-doption>
        </template>
      </a-dsubmenu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { useRecycleStore } from '../../../stores/file-recycle'

const store = useRecycleStore()
const { getFileList } = store
const { order } = storeToRefs(store)
const route = useRoute()

const sortOptions = [
  { label: '文件名称', value: 'name' },
  { label: '文件大小', value: 'size' },
  { label: '创建时间', value: 'created_at' },
  { label: '修改时间', value: 'updated_at' },
  { label: '文件类型', value: 'file_type' }
]

const handleSelect = (value: string) => {
  order.value = value
  getFileList(route.query.folder as string)
}
</script>

<style lang="scss" scoped></style>

<template>
  <div class="file-recycle-page h-100 flex-column p-20">
    <div class="flex-yc flex-sb mb-20">
      <Breadcrumb class="mr-20 flex-1 w-0" />
      <Operate />
    </div>

    <FileList class="flex-1 h-0" />

    <FileDetail />
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from './bread-crumb/index.vue'
import Operate from './operate/index.vue'
import FileList from './file-list/index.vue'
import FileDetail from './dialog/file-detail.vue'
</script>

<style lang="scss" scoped></style>

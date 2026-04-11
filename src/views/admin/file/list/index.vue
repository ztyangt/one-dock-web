<template>
  <div class="drive-page p-15">
    <SideMenu class="mr-15" />
    <main class="drive-main">
      <HeaderToolbar />
      <BatchSlide />
      <FileList class="mt-15" />
    </main>
  </div>
</template>

<script setup lang="ts">
import SideMenu from './SideMenu.vue'
import HeaderToolbar from './HeaderToolbar.vue'
import FileList from './FileList.vue'
import BatchSlide from './BatchSlide.vue'
</script>

<style scoped lang="scss">
.drive-page {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.drive-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>

<template>
  <div class="file-manage-page h-100 flex-column p-20">
    <!-- <div class="file-manage-header flex-wrap g-15 flex-yc g-10 flex-sb mb-20">
      <div class="flex-yc">
        <Strategy />
      </div>
      <div class="flex-yc">
        <Search class="mr-15" />
        <CreateBtn />
      </div>
    </div> -->

    <!-- <FilePath class="flex-yc mb-10" /> -->

    <div class="flex-yc flex-sb mb-15">
      <Breadcrumb class="mr-15 flex-1 w-0" />
      <StrategyFilter class="mr-15" />

      <Operate />
    </div>

    <FileList class="flex-1 h-0" />

    <MoveModal />
    <FileDetail />
    <RenameFileDialog />
    <CreateFolderDialog />
  </div>
</template>

<script setup lang="ts">
import StrategyFilter from './strategy-filter/index.vue'

import Breadcrumb from './bread-crumb/index.vue'
import Operate from './operate/index.vue'
import FileList from './file-list/index.vue'
import MoveModal from './dialog/move.vue'
import CreateFolderDialog from './dialog/create-folder.vue'
import RenameFileDialog from './dialog/rename.vue'
import FileDetail from './dialog/file-detail.vue'
</script>

<style lang="scss" scoped></style>

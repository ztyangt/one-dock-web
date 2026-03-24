<template>
  <a-button-group>
    <template v-if="checkedList.length == 0">
      <Refresh />
      <Sort />
      <CreateBtn />
      <!-- <View /> -->
    </template>
    <template v-else>
      <MultipleDelete />
      <SelectAll />
      <CancelSelect />
    </template>
  </a-button-group>
</template>

<script setup lang="ts">
import Refresh from './refresh.vue'
import View from './view.vue'
import CreateBtn from '../create-btn/index.vue'
import Sort from './sort.vue'
import MultipleDelete from './multiple-delete.vue'
import CancelSelect from './cancel-select.vue'
import SelectAll from './select-all.vue'
import { useFileListStore } from '../../../stores/file-list'

const store = useFileListStore()
const { checkedList } = storeToRefs(store)
</script>

<style lang="scss" scoped></style>

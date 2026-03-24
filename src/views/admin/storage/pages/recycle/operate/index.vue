<template>
  <a-button-group>
    <template v-if="checkedList.length == 0">
      <Refresh />
      <Sort />
      <!-- <View /> -->
    </template>
    <template v-else>
      <MultipleRestore />
      <SelectAll />
      <CancelSelect />
    </template>
  </a-button-group>
</template>

<script setup lang="ts">
import Refresh from './refresh.vue'
import Sort from './sort.vue'
import MultipleRestore from './multiple-restore.vue'
import CancelSelect from './cancel-select.vue'
import SelectAll from './select-all.vue'
import { useRecycleStore } from '../../../stores/file-recycle'

const store = useRecycleStore()
const { checkedList } = storeToRefs(store)
</script>

<style lang="scss" scoped></style>

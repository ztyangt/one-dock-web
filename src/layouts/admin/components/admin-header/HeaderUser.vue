<template>
  <a-popover position="br" trigger="click">
    <div class="header-user-wrap br-50 pointer secondary-bg">
      <img v-if="user?.avatar" :src="getUrl(user?.avatar)" class="br-50 wh-100" />
    </div>
    <template #content>
      <p>自定义菜单</p>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const { user } = storeToRefs(useUserStore())
const { getUrl } = useSystemStore()
</script>

<style lang="scss" scoped>
.header-user-wrap {
  height: 32px;
  width: 32px;
}
</style>

<template>
  <div class="file-page wh-100 flex">
    <div class="file-side-wrap flex-shrink-0 flex-column h-100 p-15 flex-sb">
      <Menus />
      <div>
        <Strategy />
      </div>
    </div>
    <router-view class="flex-1" v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path"></component>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import Menus from './menus.vue'
import Strategy from './strategy.vue'
</script>

<style lang="scss" scoped>
.file-page {
  overflow: auto;
}
.file-side-wrap {
  background: var(--card-bg);
  border-left: 1px solid var(--border-color);
  top: 0;
  position: sticky;
}
</style>

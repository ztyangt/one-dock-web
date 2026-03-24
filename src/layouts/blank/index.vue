<template>
  <div class="blank-layout-main main-bg relative flex-center">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <KeepAlive v-if="!route.meta.noKeepAlive">
          <component :is="Component" :key="route.path"></component>
        </KeepAlive>
        <component v-else :is="Component" :key="route.path"></component>
      </transition>
    </router-view>
    <!-- <Particles /> -->
  </div>
</template>

<script setup lang="ts">
// import Particles from './components/Particles/index.vue'
import { useTheme } from '@wiit/vue3-helper'

const { isDark } = useTheme()

watch(
  isDark,
  (val) => {
    if (val) {
      document.body.setAttribute('arco-theme', 'dark')
    } else {
      document.body.removeAttribute('arco-theme')
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.blank-layout-main {
  height: 100vh;
}
</style>

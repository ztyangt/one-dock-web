<template>
  <button
    @click="toggleTheme"
    class="theme-btn pointer icon-btn flex-center"
    id="theme-toggle"
    title="切换主题"
  >
    {{ !isDark ? '🌙' : '☀️' }}
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@wiit/vue3-helper'
const { isDark, toggleTheme } = useTheme()
</script>

<style lang="scss" scoped></style>

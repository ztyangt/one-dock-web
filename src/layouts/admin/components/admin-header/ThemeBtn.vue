<template>
  <div
    class="header-theme-btn br-50 secondary-bg text-color pointer flex-center"
    @click="toggleTheme"
  >
    <c-icon :size="15" v-if="isDark" name="sun-fill" />
    <c-icon :size="15" v-else name="moon-clear-fill" />
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@wiit/vue3-helper'
const { isDark, toggleTheme } = useTheme()
</script>

<style lang="scss" scoped>
.header-theme-btn {
  height: 26px;
  width: 26px;
  &:hover {
    background: var(--hover-bg);
  }
}
</style>

<template>
  <div class="admin-side-wrap h-100 flex-column">
    <!-- <AdminLogo class="flex-shrink-0" /> -->
    <AdminMenu class="flex-1 h-0 mt-15" />
  </div>
</template>

<script setup lang="ts">
import AdminMenu from './side-menu.vue'
</script>

<style lang="scss" scoped>
.admin-side-wrap {
  width: 200px;
  border-right: 1px solid var(--color-border);
  background: var(--color-panel);
  backdrop-filter: blur(12px);
}
</style>

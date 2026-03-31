<template>
  <div class="admin-header-wrap flex-yc px-20">
    <div class="flex-1">
      <AdminLogo class="w-fit" />
    </div>
    <div class="flex-yc g-20">
      <ThemeBtn />
      <AdminUser />
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeBtn from './theme-btn.vue'
import AdminLogo from './side-logo.vue'
import AdminUser from './admin-user.vue'
</script>

<style lang="scss">
.admin-header-wrap {
  height: 60px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-panel);
  backdrop-filter: blur(12px);

  .icon-btn {
    background: var(--color-tag);
    border: 1px solid var(--color-border);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    color: var(--color-text-muted);
    transition: all 0.3s;
    &:hover {
      transform: scale(1.05);
      background: var(--color-panel-hover);
    }
  }
}
</style>

<template>
  <div class="admin-header-wrap card-bg w-100 flex-yc flex-sb p-10">
    <HeaderLogo />
    <div class="header-right flex-yc">
      <ThemeBtn class="mr-15" />
      <HeaderUser />
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderLogo from './HeaderLogo.vue'
import ThemeBtn from './ThemeBtn.vue'
import HeaderUser from './HeaderUser.vue'
</script>

<style lang="scss" scoped>
.admin-header-wrap {
  height: 60px;
  border-bottom: 1px solid var(--border-color);
}
</style>

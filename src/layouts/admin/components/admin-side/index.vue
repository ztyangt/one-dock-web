<template>
  <div class="admin-side-wrap no-select flex-column h-100">
    <!-- <AdminSideTop /> -->
    <!-- <a-divider class="mb-15 mt-0" style="border-color: var(--border-color)" /> -->
    <AdminSideMenu class="flex-1 h-0 p-10 overhide" />

    <!-- <UserCard v-if="!isMobile" />
    <a-popover v-else position="right" trigger="hover" content-class="popover-user-card">
      <div class="flex-center mb-15 pointer mt-15"><UserAvatar :size="28" /></div>
      <template #content>
        <UserCard />
      </template>
    </a-popover> -->

    <AdminSideBottom class="flex-shrink-0" />
  </div>
</template>

<script setup lang="ts">
import UserCard from './user-card.vue'
import AdminSideTop from './admin-side-top.vue'
import AdminSideBottom from './admin-side-bottom.vue'
import AdminSideMenu from './admin-side-menu.vue'
import UserAvatar from './user-avatar.vue'

const { isMobile } = storeToRefs(useSystemStore())
</script>

<style lang="scss">
.popover-user-card {
  width: 250px;
  padding: 0;
}

.admin-side-wrap {
  background: var(--card-bg);
}

.arco-layout-sider-light {
  background-color: transparent !important;
}
</style>

<template>
  <div v-if="user">
    <Avatar
      class="avatar-wrap avatar-btn pointer no-select"
      :label="user.nickname.slice(0, 1).toUpperCase()"
      shape="circle"
      :image="user.avatar"
      @click="toggle"
    />

    <Popover ref="popoverRef" class="p-5">
      <div class="flex-yc" style="width: 180px">
        <Avatar
          class="avatar-wrap avatar-logo pointer no-select"
          :label="user.nickname.slice(0, 1).toUpperCase()"
          shape="circle"
          size="large"
          :image="user.avatar"
        />

        <div class="ml-10">
          <div>{{ user.nickname }}</div>
          <div class="fs-12 user-desc">{{ user.email }}</div>
        </div>
      </div>
      <Divider />

      <div class="flex-yc pointer avatar-menu">
        <span>👤</span>
        <span>个人设置</span>
      </div>
      <div class="flex-yc pointer avatar-menu mt-5" @click="logoutRef?.logout">
        <span>🚪</span>
        <span>退出登录</span>
      </div>
    </Popover>
    <AdminLogout ref="logoutRef" />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import AdminLogout from './admin-logout.vue'

const popoverRef = ref()
const logoutRef = ref()

const { user } = storeToRefs(useUserStore())

const toggle = (e: Event) => {
  popoverRef.value?.toggle(e)
}
</script>

<style lang="scss" scoped>
.avatar-menu {
  gap: 12px;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    background: var(--color-primary-bg);
    color: var(--color-primary-solid);
    // transform: translateX(4px);
    padding-left: 12px;
  }
}

.avatar-wrap {
  border: 1px solid var(--color-border);
  transition: all 0.3s;
}

.avatar-logo {
  height: 46px;
  width: 46px;
}

.avatar-btn {
  cursor: pointer;
  &:hover {
    transform: scale(1.05);
    border-color: var(--color-primary-solid);
    box-shadow: 0 0 0 3px var(--color-primary-bg);
  }
}

.user-desc {
  color: var(--color-text-muted);
  margin-top: 3px;
}
</style>

<template>
  <a-dropdown trigger="hover" position="bl">
    <a-avatar
      :size="30"
      object-fit="cover"
      :image-url="`${userStore.user?.avatar}`"
      class="pointer"
    >
      {{ userStore.user?.nickname }}
    </a-avatar>
    <template #content>
      <a-doption>
        <div class="flex-yc g-5">
          <c-icon name="settings-line" />
          <span>系统设置</span>
        </div>
      </a-doption>
      <a-doption @click="methods.handleLogout">
        <div class="flex-yc g-5">
          <c-icon name="login-circle-line" />
          <span>退出登录</span>
        </div>
      </a-doption>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { Modal } from '@arco-design/web-vue'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const methods = {
  handleLogout: () => {
    Modal.warning({
      simple: true,
      hideCancel: false,
      titleAlign: 'start',
      title: '确认退出登录吗？',
      content: '确认退出登录吗？',
      onOk: () => {
        router.replace({
          name: 'login',
          query: { redirect: encodeURIComponent(route.fullPath) }
        })
        userStore.logout()
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.arco-avatar-image {
  line-height: 30px;
}
</style>

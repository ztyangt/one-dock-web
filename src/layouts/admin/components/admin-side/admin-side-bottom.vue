<template>
  <div class="admin-side-bottom-wrap flex-center p-10 mb-10">
    <div class="flex-sb flex-center text-center" :class="{ 'w-100': !isMobile }">
      <a-button class="card-bg" v-if="!isMobile" @click="handleLogout" size="small">
        <c-icon name="logout-circle-r-line" class="mr-5" size="14" /> 退出
      </a-button>
      <div :class="isMobile ? 'block' : 'flex-yc'">
        <a-tooltip content="版本更新" mini>
          <div
            class="bottom-btn hover-bg flex-center pointer br-5"
            :class="{ 'mr-5': !isMobile, 'mb-10': isMobile }"
          >
            <c-icon style="margin-top: 2px" name="send-plane-fill" class="icon-color" size="20" />
          </div>
        </a-tooltip>

        <a-tooltip content="退出登录" mini>
          <div
            v-if="isMobile"
            class="bottom-btn flex-center hover-bg pointer br-5"
            :class="{ 'mr-5': !isMobile, 'mb-0': isMobile }"
            @click="handleLogout"
          >
            <c-icon name="logout-circle-r-fill" class="icon-color" size="18" />
          </div>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Modal } from '@arco-design/web-vue'

const userStore = useUserStore()
const { isMobile } = storeToRefs(useSystemStore())

const handleLogout = () => {
  Modal.info({
    simple: true,
    hideCancel: false,
    alignCenter: true,
    titleAlign: 'start',
    title: '确认退出登录吗？',
    content: '确认退出登录吗？',

    onOk: () => {
      userStore.logout()
    }
  })
}
</script>

<style lang="scss" scoped>
.bottom-btn {
  height: 28px;
  width: 28px;
  background-color: var(--card-bg);
}
</style>

<template>
  <div class="admin-layout-container main-bg-style flex-column">
    <Toast />

    <AdminHeader class="flex-shrink-0" />

    <div class="flex-1 h-0 flex">
      <AdminSide class="flex-shrink-0" />

      <ScrollPanel class="flex-1 w-0" ref="scrollPanelRef">
        <router-view v-slot="{ Component, route }">
          <!-- 利用 transition 的 @before-enter 钩子在 DOM 刚准备好时恢复滚动 -->
          <transition
            :name="route.meta.noTransition ? '' : 'fade'"
            mode="out-in"
            @before-enter="restoreScrollPosition"
          >
            <KeepAlive v-if="!route.meta.noKeepAlive">
              <component :is="Component" :key="route.path"></component>
            </KeepAlive>
            <component v-else :is="Component" :key="route.path"></component>
          </transition>
        </router-view>
      </ScrollPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminSide from './admin-side/index.vue'
import AdminHeader from './admin-header/index.vue'

const route = useRoute()
const router = useRouter()

// 用于存储每个路由的滚动位置
const scrollPositions = new Map<string, number>()
const scrollPanelRef = ref()

/**
 * 获取真正的滚动容器 DOM
 * 注意：UI 库的 ScrollPanel 组件通常会包裹一层。
 * 这里以 PrimeVue (.p-scrollpanel-content) 或 ElementPlus (.el-scrollbar__wrap) 为例。
 * 如果你是手写的组件，可以直接返回 el。
 */
const getScrollTarget = (): HTMLElement | null => {
  if (!scrollPanelRef.value) return null
  const el = scrollPanelRef.value.$el || scrollPanelRef.value
  return el.querySelector('.p-scrollpanel-content') || el.querySelector('.el-scrollbar__wrap') || el
}

// 1. 在路由切换【前】，记录当前页面的滚动位置
router.beforeEach((to, from) => {
  const scrollTarget = getScrollTarget()
  if (scrollTarget) {
    scrollPositions.set(from.path, scrollTarget.scrollTop)
  }
  return true
})

// 2. 在新页面动画【进入前】（此时 DOM 已经挂载并有了高度），恢复滚动位置
const restoreScrollPosition = () => {
  nextTick(() => {
    const scrollTarget = getScrollTarget()
    if (scrollTarget) {
      // 获取目标路由存储的滚动高度，若没有则默认置顶 (0)
      const targetScrollTop = scrollPositions.get(route.path) || 0
      scrollTarget.scrollTop = targetScrollTop
    }
  })
}
</script>

<style lang="scss">
.admin-layout-container {
  height: 100vh;
  position: relative;

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.35s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>

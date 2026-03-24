<template>
  <div class="admin-header-wrap h-100">
    <div class="header-wrap flex-yc flex-sb h-100 px-15">
      <div class="flex-yc g-20">
        <div
          class="text-color pointer fw-600 hide-xs"
          style="margin-top: 2px"
          @click="sysStore.toggleDevice()"
        >
          <c-icon name="indent-decrease" size="18" />
        </div>
        <a-breadcrumb>
          <c-icon name="map-pin-range-fill" />
          <a-breadcrumb-item class="fs-15" v-for="(item, index) in breadcrumbList" :key="index">
            {{ item }}
          </a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      <div class="flex-yc g-15">
        <ThemeBtn />
        <div
          class="header-btn flex-center br-50 pointer text-color theme-hover mr-10"
          @click="toggleFullScreen()"
        >
          <c-icon v-if="!isFullscreen" name="fullscreen-fill" />
          <c-icon v-else name="fullscreen-exit-fill" />
        </div>
        <AdminAvatar />
      </div>
    </div>

    <AdminHeaderTabs class="header-tab-wrap" />
  </div>
</template>

<script setup lang="ts">
import ThemeBtn from '@/components/comm/theme-btn.vue'

const route = useRoute()
const { isFullscreen, toggle: toggleFullScreen } = useFullscreen()

const sysStore = useSystemStore()

const breadcrumbList = computed(() => {
  return route.matched.map((item) => item.meta.title).slice(1)
})
</script>

<style lang="scss" scoped>
.admin-header-wrap {
  .header-btn {
    height: 28px;
    width: 28px;
  }

  .header-wrap {
    height: 60px;
  }

  .header-tab-wrap {
    height: 35px;
  }
}
</style>

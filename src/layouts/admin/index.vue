<template>
  <a-layout class="layout-admin-container flex-column">
    <AdminHeader />
    <div class="flex-1 h-0 flex">
      <AdminSide class="flex-shrink-0" style="width: 70px" />

      <div class="flex-1" style="width: calc(100% - 70px)">
        <a-scrollbar style="height: calc(100vh - 60px)">
          <router-view v-slot="{ Component, route }">
            <transition :name="route.meta.noTransition ? '' : 'fade'" mode="out-in">
              <KeepAlive v-if="!route.meta.noKeepAlive">
                <component :is="Component" :key="route.path"></component>
              </KeepAlive>
              <component v-else :is="Component" :key="route.path"></component>
            </transition>
          </router-view>
        </a-scrollbar>
      </div>
    </div>
  </a-layout>
</template>

<script setup lang="ts">
import AdminSide from './components/admin-side/index.vue'
import AdminHeader from './components/admin-header/index.vue'
import { useTheme } from '@wiit/vue3-helper'
const { isMobile } = storeToRefs(useSystemStore())

const { isDark } = useTheme()

watch(
  isDark,
  (val) => {
    if (val) {
      document.body.setAttribute('arco-theme', 'dark')
    } else {
      document.body.removeAttribute('arco-theme')
    }
  },
  { immediate: true }
)
</script>

<style lang="scss">
.layout-admin-container {
  height: 100vh;
  color: var(--text-color);
  position: relative;
  background: var(--main-bg);

  @include respond-to('phone') {
    .arco-layout-sider {
      width: 50px !important;
    }
  }

  .arco-layout-sider-children {
    overflow: visible;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.35s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .base-table-card-wrap {
    display: flex;
    overflow: hidden;
    flex-direction: column;

    thead {
      user-select: none;
    }

    .arco-card-header {
      flex-shrink: 0;
    }

    .arco-card-body {
      flex: 1;
      height: 0;

      .arco-table {
        flex: 1;
        height: 0 !important;
      }

      .arco-table-container {
        .arco-scrollbar-thumb-bar,
        .arco-scrollbar-track {
          display: none !important;
        }
      }
    }
  }
}
</style>

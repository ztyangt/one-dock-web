<template>
  <div class="admin-side-menu-list-wrap flex-column">
    <a-scrollbar class="h-100" style="overflow: auto">
      <div
        class="menu-item pointer mb-5 br-5"
        :class="{ 'active-menu': activeName === menu.name, 'collapsed-menu': isMobile }"
        v-for="(menu, index) in routeList"
        :key="index"
        @click="methods.handleClick(menu.name as string)"
        v-ripple
        :style="{
          backgroundColor: activeName === menu.name ? `${menu.meta?.color + '20'}` : 'transparent'
        }"
      >
        <c-icon
          class="icon-color"
          :style="{ color: activeName === menu.name ? menu.meta?.color : 'var(--icon-color)' }"
          :name="menu.meta!.icon as string"
          size="18"
        />
        <div class="fw-500 menu-title">{{ menu.meta?.title }}</div>
      </div>
    </a-scrollbar>
  </div>
</template>

<script setup lang="ts">
import ADMIN_ROUTES from '@/router/routes/admin'
import { RouterEmitter } from '@/emitter/router'

const sysStore = useSystemStore()
const { isMobile } = storeToRefs(sysStore)
const routeList =
  ADMIN_ROUTES[0]?.children?.filter((it) => it.meta?.isDev !== true || import.meta.env.DEV) || []

const route = useRoute()
const router = useRouter()

const activeName = ref(String(route.matched[1]?.name))

RouterEmitter.on('ROUTE:CHANGE', (val: any) => {
  activeName.value = val.matched[1].name as string
})

const methods = {
  handleClick: (e: string) => {
    activeName.value = e
    router.push({ name: e })
  }
}

onBeforeUnmount(() => {
  RouterEmitter.off('ROUTE:CHANGE')
})
</script>

<style lang="scss">
.admin-side-menu-list-wrap {
  @include respond-to('phone') {
    padding-left: 5px !important;
    padding-right: 5px !important;
  }

  .arco-scrollbar {
    height: 100%;
  }
  .menu-item {
    height: 48px;
    display: flex;
    padding-top: 7px;
    padding-bottom: 7px;
    align-items: center;
    padding-left: 10px;
    .menu-title {
      margin-left: 10px;
    }

    &:hover {
      background-color: #ffffff12;
    }

    &.collapsed-menu {
      display: block;
      height: fit-content;
      text-align: center;
      padding-left: 0;

      .menu-title {
        font-size: 12px;
        margin-left: 0;
        margin-top: 3px;
      }
    }
  }

  .active-menu {
    background-color: var(--card-bg);
    .menu-title {
      color: var(--title-color) !important;
      font-weight: 500;
    }
  }
}
</style>

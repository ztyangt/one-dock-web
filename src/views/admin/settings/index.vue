<template>
  <div class="settings-page wh-100 flex">
    <div class="setting-menus p-10">
      <router-link
        v-for="item in menuList"
        :key="item.name"
        :to="{ name: item.name }"
        :class="{ active: route.name === item.name }"
        v-ripple
        class="setting-menu text-color hover-weight py-10 my-5 px-15 br-5"
      >
        <div class="flex-yc">
          <c-icon :name="item.icon" color="var(--text-color)" class="mr-10"></c-icon>
          <div>{{ item.title }}</div>
        </div>
      </router-link>
    </div>
    <router-view class="flex-1" v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path"></component>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const menuList = [
  { title: '个人信息', name: 'settings-profile', icon: 'user-settings-line' },
  { title: '后台设置', name: 'settings-admin', icon: 'earth-line' },
  { title: '系统设置', name: 'settings-system', icon: 'settings-6-line' }
]
</script>

<style lang="scss" scoped>
.settings-page {
  overflow: auto;
}
.setting-menus {
  background: var(--card-bg);
  border-left: 1px solid var(--border-color);
  top: 0;
  position: sticky;

  .setting-menu {
    display: block;
    cursor: pointer;
    text-decoration: none;

    &.active {
      background-color: var(--secondary-bg);
      color: var(--weight-color);

      i {
        color: var(--weight-color) !important;
      }
    }
  }
}
</style>

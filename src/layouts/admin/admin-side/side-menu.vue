<template>
  <ScrollPanel style="width: 100%; height: 200px">
    <div class="admin-side-menu sidebar-nav p-15">
      <template v-for="menu in menuList" :key="menu.name">
        <a
          v-if="!menu.children"
          href="#"
          class="nav-item single-link"
          :class="{ active: activeMenuId === menu.name }"
          @click.prevent="selectMenu(menu)"
        >
          <c-icon :name="menu.meta.icon" size="18" />
          <span class="nav-text">{{ menu.meta?.title }}</span>
        </a>

        <div
          v-else
          class="nav-group active"
          :class="{ expanded: expandedGroups.includes(menu.name) }"
        >
          <div
            class="nav-item has-child"
            :class="{ active: activeParentGroup === menu.name }"
            @click="toggleGroup(menu)"
          >
            <c-icon :name="menu.meta.icon" size="18" />
            <span class="nav-text">{{ menu.meta?.title }}</span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <!-- 子菜单内容 -->
          <div class="sub-nav">
            <div class="sub-nav-inner">
              <a
                v-for="child in menu.children"
                :key="child.name"
                href="#"
                class="sub-nav-item single-link"
                :class="{ active: activeMenuId === child.name }"
                @click.prevent="selectMenu(child, menu)"
              >
                {{ child.meta?.title }}
              </a>
            </div>
          </div>
        </div>
      </template>
    </div>
  </ScrollPanel>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ADMIN_ROUTES from '@/router/routes/admin'

const route = useRoute()
const router = useRouter()

const menuList: any[] = ADMIN_ROUTES[0].children!.filter((item) =>
  import.meta.env.DEV ? true : !item.meta?.isDev,
)

const expandedGroups = ref<string[]>([])
const activeMenuId = ref<string>()
const activeParentGroup = ref<string | null>(null)

const toggleGroup = (menu: any) => {
  if (expandedGroups.value.includes(menu.name)) {
    expandedGroups.value = expandedGroups.value.filter((item) => item !== menu.name)
  } else {
    expandedGroups.value.push(menu.name)
  }
}

const selectMenu = (item: any, parentGroup: any = null) => {
  activeMenuId.value = item.name
  router.push({ name: item.name })
  activeParentGroup.value = parentGroup?.name || null
}

// 使用 watch 监听路由变化，并立即执行一次（替代 onMounted 的初始赋值）
watch(
  () => route.name,
  (newRouteName) => {
    if (!newRouteName) return

    // 1. 设置当前激活的子菜单ID
    activeMenuId.value = newRouteName as string

    // 2. 查找当前路由所在的父级菜单
    const parentMenu = menuList.find(
      (menu) => menu.children && menu.children.some((child: any) => child.name === newRouteName),
    )

    if (parentMenu) {
      // 3. 设置当前激活的父级菜单高亮
      activeParentGroup.value = parentMenu.name

      // 4. 如果父级菜单未展开，则将其加入展开列表
      if (!expandedGroups.value.includes(parentMenu.name)) {
        expandedGroups.value.push(parentMenu.name)
      }
    } else {
      // 如果是一级路由，清空父级高亮状态
      activeParentGroup.value = null
    }
  },
  { immediate: true }, // 立即执行，相当于在 onMounted 中调用
)
</script>

<style lang="scss" scoped>
.sidebar-nav {
  flex: 1;
  padding: 0 1rem 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.nav-group {
  display: flex;
  flex-direction: column;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 1rem;
  border-radius: 12px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  background: transparent;
}
.nav-item.active {
  background: var(--color-primary-bg);
  color: var(--color-primary-text);
  border-color: var(--color-primary-border);
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.menu-icon svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.2;
  flex-shrink: 0;
}
.nav-item .nav-text {
  flex: 1;
}
.nav-item .chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.6;
}
.nav-group.expanded .nav-item .chevron {
  transform: rotate(180deg);
  opacity: 1;
}

.sub-nav {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.nav-group.expanded .sub-nav {
  grid-template-rows: 1fr;
}
.sub-nav-inner {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-left: 2.4rem;
  padding-top: 0;
  position: relative;
  min-height: 0;
}
.nav-group.expanded .sub-nav-inner {
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
}
.sub-nav-inner::before {
  content: '';
  position: absolute;
  left: 1.35rem;
  top: 0.3rem;
  bottom: 0.5rem;
  width: 1px;
  background: var(--color-border);
}

.sub-nav-item {
  padding: 0.5rem 1rem;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  display: block;
}
.sub-nav-item:hover {
  color: var(--color-text-main);
  background: var(--color-tag);

  transform: translateX(2px);
}
.sub-nav-item.active {
  color: var(--color-primary-solid);
  font-weight: 600;
  background: var(--color-tag);
}
.sub-nav-item.active::before {
  content: '';
  position: absolute;
  left: -1.15rem;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-primary-solid);
  box-shadow: 0 0 8px var(--color-primary-solid);
}
</style>

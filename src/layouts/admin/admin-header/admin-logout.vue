<template>
  <ConfirmDialog></ConfirmDialog>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useConfirm } from 'primevue/useconfirm'

const store = useUserStore()
const confirm = useConfirm()
const isPopoverOpen = ref(false)

// 控制原版 Popover 显示/隐藏
const togglePopover = (e: Event) => {
  e.stopPropagation()
  isPopoverOpen.value = !isPopoverOpen.value
}

// 点击外部关闭 Popover
const closePopover = () => {
  isPopoverOpen.value = false
}

onMounted(() => document.addEventListener('click', closePopover))
onUnmounted(() => document.removeEventListener('click', closePopover))

// 触发 PrimeVue 退出登录确认弹窗
const confirmLogout = (event: Event) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: '确定要退出当前账号吗？',
    icon: 'pi pi-exclamation-circle', // 如果你使用了 PrimeIcons
    acceptLabel: '退出',
    rejectLabel: '取消',
    acceptClass: 'p-button-danger custom-accept-btn',
    rejectClass: 'p-button-secondary custom-reject-btn',
    accept: () => {
      // 在这里执行你的退出登录逻辑，比如清除 Token，跳转路由等
      console.log('用户已退出')
      store.logout()
    },
    reject: () => {
      // 用户取消退出
      closePopover()
    },
  })
}

defineExpose({ logout: confirmLogout })
</script>

<style lang="scss" scoped>
/* =========================================
   PrimeVue ConfirmPopup 炫酷毛玻璃主题重写
   基于先前的 CSS 变量 (var(--color-panel) 等)
   ========================================= */

/* 1. 弹窗主面板重写为毛玻璃 */
.p-confirmpopup {
  background: var(--color-panel) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 16px !important;
  box-shadow: var(--shadow-popover), var(--highlight-panel) !important;
  color: var(--color-text-main) !important;
  padding: 8px !important;
  font-family: inherit !important;
}

/* 2. 弹窗上的小箭头 (Tail) 颜色适配 */
/* 亮色/暗色模式下，小箭头颜色自动跟随边框与背景 */
.p-confirmpopup::before {
  border-bottom-color: var(--color-border) !important;
}
.p-confirmpopup::after {
  border-bottom-color: var(--color-panel) !important;
}
/* 处理箭头在上方时的情况 */
.p-confirmpopup-flipped::before {
  border-top-color: var(--color-border) !important;
}
.p-confirmpopup-flipped::after {
  border-top-color: var(--color-panel) !important;
}

/* 3. 内容区与文字 */
.p-confirmpopup-content {
  padding: 1rem !important;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* 警告图标颜色适配暗黑/亮色主题 */
.p-confirmpopup-icon {
  color: var(--color-danger) !important;
  font-size: 1.2rem !important;
}

.p-confirmpopup-message {
  font-weight: 500;
  color: var(--color-text-main) !important;
  margin: 0 !important;
  font-size: 0.95rem;
}

/* 4. 底部按钮容器 */
.p-confirmpopup-footer {
  padding: 0 1rem 0.5rem 1rem !important;
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
}

/* 5. 通用按钮复写：圆角与字体 */
.p-confirmpopup .p-button {
  padding: 0.5rem 1rem !important;
  border-radius: 10px !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  border: none !important;
  transition: all 0.2s ease !important;
}

/* 6. 取消按钮 (自定义类) */
.p-confirmpopup .custom-reject-btn {
  background: var(--color-tag) !important;
  color: var(--color-text-muted) !important;
  box-shadow: none !important;
}
.p-confirmpopup .custom-reject-btn:hover {
  background: var(--color-border) !important;
  color: var(--color-text-main) !important;
}

/* 7. 确认退出按钮 (自定义类) - 使用危险红色光晕效果 */
.p-confirmpopup .custom-accept-btn {
  background: rgba(239, 68, 68, 0.15) !important;
  color: var(--color-danger) !important;
  border: 1px solid rgba(239, 68, 68, 0.3) !important;
}
.p-confirmpopup .custom-accept-btn:hover {
  background: var(--color-danger) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
  transform: translateY(-1px);
}
</style>

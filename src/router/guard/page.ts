import type { Router } from 'vue-router'
import { RouterEmitter } from '@/emitter'
import { useConfigStore } from '@/stores/config'
// import NProgress from 'nprogress'

// const defaultTitle = import.meta.env.APP_TITLE
export default async function setupPageGuard(router: Router) {
  router.beforeEach(async (to) => {
    const userStore = useUserStore()
    userStore.init()
    const store = useConfigStore()
    if (to.name !== 'install' && !store.hasConfig) {
      await store.getConfig()
    }
    const title = store.config?.title
    // 发布路由跳转事件
    RouterEmitter.emit('ROUTE:CHANGE', to)
    // 设置页面标题

    let pageTitle = title

    if (to.meta?.title) {
      if (pageTitle) {
        pageTitle = `${to.meta.title}-${pageTitle}`
      } else {
        pageTitle = to.meta.title as string
      }
    } else {
      pageTitle = pageTitle || '相左工作室'
    }

    document.title = pageTitle
  })
}

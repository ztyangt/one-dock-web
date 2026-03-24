import type { Router } from 'vue-router'

export default function setupDevGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    if (!import.meta.env.DEV) {
      // 生产环境
      if (to.meta.isDev) next({ name: '404' })
      else next()
    } else {
      next()
    }
  })
}

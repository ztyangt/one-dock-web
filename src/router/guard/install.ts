import type { Router, RouteRecordNormalized } from 'vue-router'

export default function setupInstallGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const { isInstall } = storeToRefs(useSystemStore())

    if (!isInstall.value) {
      if (to.name === 'install') next()
      else next({ name: 'install' })
    } else {
      window.parent.postMessage({ type: 'install', data: true }, '*')
      if (to.name === 'install') next({ name: 'Admin' })
      else next()
    }
  })
}

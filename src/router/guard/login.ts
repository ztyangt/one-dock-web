import type {
  LocationQueryRaw,
  RouteLocationNormalizedGeneric,
  RouteLocationNormalizedLoadedGeneric,
  NavigationGuard,
} from 'vue-router'
import type { Router } from 'vue-router'

const jumpLogin = (
  to: RouteLocationNormalizedGeneric,
  from: RouteLocationNormalizedLoadedGeneric,
): ReturnType<NavigationGuard> => {
  if (to.meta.needLogin) {
    return {
      name: 'login',
      query: {
        redirect: encodeURIComponent(to.fullPath),
        ...to.query,
      } as LocationQueryRaw,
    }
  }
  return true
}

export default function setupUserLoginInfoGuard(router: Router) {
  router.beforeEach((to, from) => {
    const userStore = useUserStore()

    if (userStore.hasLogin) {
      // 已登录状态
      if (to.name === 'login' || to.name === 'Login') {
        return { name: 'Main' }
      }
      return true
    } else {
      // 未登录状态
      if (to.name === 'login' || to.name === 'Login') {
        return true
      }
      return jumpLogin(to, from)
    }
  })
}

import type { Router } from 'vue-router'
import setupDevGuard from './dev'
import setupPageGuard from './page'
import setupLoginGuard from './login'
import setupInstallGuard from './install'

// import setupPermissionGuard from './permission'

export default function createRouteGuard(router: Router) {
  // 页面守卫
  setupPageGuard(router)

  // 安装守卫
  setupInstallGuard(router)

  // 开发守卫
  // setupDevGuard(router)

  // 登录守卫
  setupLoginGuard(router)

  // setupPermissionGuard(to, from, next)
}

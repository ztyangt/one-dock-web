import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from '@/layouts/admin/index.vue'
import { transition } from '@vueuse/core'

const ADMIN_ROUTES: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'Admin',
    component: AdminLayout,
    redirect: { name: 'admin-home' },
    meta: { needLogin: true },
    children: [
      {
        path: 'home',
        name: 'admin-home',
        component: () => import('@/views/admin/home/index.vue'),
        meta: { title: '首页', icon: 'home-5-fill', color: '#f46bca' }
      },
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/admin/user/index.vue'),
        meta: { title: '用户', icon: 'user-star-fill', color: '#cd463a' }
      },
      {
        path: 'storage',
        name: 'storage',
        component: () => import('@/views/admin/storage/pages/index/index.vue'),
        meta: {
          title: '存储',
          icon: 'file-upload-fill',
          color: '#5fccab',
          noKeepAlive: true,
          noTransition: true
        },
        redirect: { name: 'storage-overview' },
        children: [
          {
            path: 'overview',
            name: 'storage-overview',
            component: () => import('@/views/admin/storage/pages/overview/index.vue'),
            meta: { title: '存储概览' }
          },
          {
            path: 'list',
            name: 'storage-list',
            component: () => import('@/views/admin/storage/pages/list/index.vue'),
            meta: { title: '文件管理' }
          },
          {
            path: 'strategy',
            name: 'storage-strategy',
            component: () => import('@/views/admin/storage/pages/strategy/index.vue'),
            meta: { title: '存储策略' }
          },
          {
            path: 'transfer',
            name: 'storage-transfer',
            component: () => import('@/views/admin/storage/pages/transfer/index.vue'),
            meta: { title: '传输任务' }
          },
          {
            path: 'recycle',
            name: 'storage-recycle',
            component: () => import('@/views/admin/storage/pages/recycle/index.vue'),
            meta: { title: '回收站' }
          }
        ]
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/admin/settings/index.vue'),
        meta: { title: '设置', icon: 'settings-3-fill', color: '#4d7df7', noTransition: true },
        redirect: { name: 'settings-profile' },
        children: [
          {
            path: 'profile',
            name: 'settings-profile',
            component: () => import('@/views/admin/settings/profile/index.vue'),
            meta: { title: '个人信息', icon: 'settings-3-fill' }
          },
          {
            path: 'admin',
            name: 'settings-admin',
            component: () => import('@/views/admin/settings/admin/index.vue'),
            meta: { title: '后台设置', icon: 'settings-3-fill' }
          },
          {
            path: 'system',
            name: 'settings-system',
            component: () => import('@/views/admin/settings/system/index.vue'),
            meta: { title: '系统设置', icon: 'settings-3-fill' }
          }
        ]
      },
      {
        path: 'dev',
        name: 'dev',
        meta: { title: '开发', icon: 'file-code-fill', color: '#4fa1e6', isDev: true },
        redirect: { name: 'dev-icon' },
        children: [
          {
            path: 'icon',
            name: 'dev-icon',
            component: () => import('@/views/admin/dev/icon/index.vue'),
            meta: { title: '图标', icon: 'money-dollar-circle-line' }
          }
        ]
      }
    ]
  }
]

export default ADMIN_ROUTES

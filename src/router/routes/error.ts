import type { RouteRecordRaw } from 'vue-router'
import BlankLayout from '@/layouts/blank/index.vue'

const ERROR_ROUTES: RouteRecordRaw[] = [
  {
    path: '/',
    component: BlankLayout,
    children: [
      {
        path: '/403',
        name: '403',
        component: () => import('@/views/error/403.vue'),
        meta: { title: '403' }
      },
      {
        path: '/404',
        name: '404',
        component: () => import('@/views/error/404.vue'),
        meta: { title: '404' }
      },
      {
        path: '/406',
        name: '406',
        component: () => import('@/views/error/406.vue'),
        meta: { title: '406' }
      },
      {
        path: '/no-service',
        name: 'no-service',
        component: () => import('@/views/error/no-service.vue'),
        meta: { title: '无服务' }
      },
      {
        name: 'NotFound',
        path: '/:pathMatch(.*)*',
        redirect: { name: '404' }
      }
    ]
  }
]

export default ERROR_ROUTES

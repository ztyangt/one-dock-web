import type { RouteRecordRaw } from 'vue-router'
import BlankLayout from '@/layouts/blank/index.vue'

const MAIN_ROUTES: RouteRecordRaw[] = [
  {
    path: '',
    name: 'Main',
    component: BlankLayout,
    redirect: { name: 'Admin' },
    meta: { needLogin: true },
    children: [
      {
        path: '/',
        name: 'home',
        component: () => import('@/views/main/home/index.vue'),
        meta: { title: '首页' }
      }
    ]
  }
]

export default MAIN_ROUTES

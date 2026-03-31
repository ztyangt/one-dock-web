import type { RouteRecordRaw } from 'vue-router'
import BlankLayout from '@/layouts/blank/index.vue'

const MAIN_ROUTES: RouteRecordRaw[] = [
  {
    path: '',
    name: 'Main',
    component: BlankLayout,
    redirect: { name: 'home' },
    meta: { needLogin: false },
    children: [
      {
        path: '/',
        name: 'home',
        component: () => import('@/views/main/home/index.vue'),
        meta: { title: '首页' },
      },
      {
        path: '/blog',
        name: 'blog-home',
        component: () => import('@/views/main/blog/index.vue'),
        meta: { title: '博客主页', noKeepAlive: true },
      },
      {
        path: '/blog/:slug',
        name: 'blog-detail',
        component: () => import('@/views/main/blog/detail.vue'),
        meta: { title: '博客文章', noKeepAlive: true },
      },
    ],
  },
]

export default MAIN_ROUTES

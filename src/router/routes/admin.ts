import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from '@/layouts/admin/index.vue'

const ADMIN_ROUTES: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'Admin',
    component: AdminLayout,
    redirect: { name: 'admin-dashboard' },
    meta: { needLogin: true },
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'home-5-fill' },
      },
      {
        path: 'life-ledger',
        name: 'admin-life-ledger',
        redirect: { name: 'admin-life-ledger-blog' },
        meta: { title: '人生手账', icon: 'booklet-fill' },
        children: [
          {
            path: 'blog',
            name: 'admin-life-ledger-blog',
            component: () => import('@/views/admin/life-ledger/blog/index.vue'),
            meta: { title: '博客文章', icon: 'article-fill' },
          },
          {
            path: 'memo',
            name: 'admin-life-ledger-memo',
            component: () => import('@/views/admin/life-ledger/memo/index.vue'),
            meta: { title: '日常备忘', icon: 'sticky-note-fill' },
          },
          {
            path: 'diary',
            name: 'admin-life-ledger-diary',
            component: () => import('@/views/admin/life-ledger/diary/index.vue'),
            meta: { title: '心事日记', icon: 'quill-pen-fill' },
          },
          {
            path: 'note',
            name: 'admin-life-ledger-note',
            component: () => import('@/views/admin/life-ledger/note/index.vue'),
            meta: { title: '灵感笔记', icon: 'lightbulb-fill' },
          },
          {
            path: 'album',
            name: 'admin-life-ledger-album',
            component: () => import('@/views/admin/life-ledger/album/index.vue'),
            meta: { title: '光影相册', icon: 'image-2-fill' },
          },
          {
            path: 'footprint',
            name: 'admin-life-ledger-footprint',
            component: () => import('@/views/admin/life-ledger/footprint/index.vue'),
            meta: { title: '足迹打卡', icon: 'map-pin-time-fill' },
          },
        ],
      },
      {
        path: 'file',
        name: 'admin-file',
        redirect: { name: 'admin-file-assets' },
        meta: { title: '文件管理', icon: 'folder-5-fill' },
        children: [
          {
            path: 'list',
            name: 'admin-file-list',
            component: () => import('@/views/admin/file/list/index.vue'),
            meta: { title: '文件列表', icon: 'file-list-3-fill' },
          },
          {
            path: 'assets',
            name: 'admin-file-assets',
            component: () => import('@/views/admin/file/assets/index.vue'),
            meta: { title: '文件资产', icon: 'folder-chart-fill' },
          },
          {
            path: 'strategy',
            name: 'admin-file-strategy',
            component: () => import('@/views/admin/file/strategy/index.vue'),
            meta: { title: '存储策略', icon: 'database-2-fill' },
          },
          {
            path: 'upload',
            name: 'admin-file-upload',
            component: () => import('@/views/admin/file/upload/index.vue'),
            meta: { title: '上传管理', icon: 'upload-cloud-2-fill' },
          },
        ],
      },
      {
        path: 'system',
        name: 'admin-system',
        redirect: { name: 'admin-system-performance' },
        meta: { title: '系统管理', icon: 'settings-5-fill' },
        children: [
          {
            path: 'performance',
            name: 'admin-system-performance',
            component: () => import('@/views/admin/system/performance/index.vue'),
            meta: { title: '性能监控', icon: 'log-fill' },
          },
          {
            path: 'setting',
            name: 'admin-system-setting',
            component: () => import('@/views/admin/system/setting/index.vue'),
            meta: { title: '系统设置', icon: 'settings-fill' },
          },
          {
            path: 'api-log',
            name: 'admin-system-api-log',
            component: () => import('@/views/admin/system/api-log/index.vue'),
            meta: { title: 'API日志', icon: 'log-fill' },
          },
        ],
      },
      {
        path: 'dev',
        name: 'admin-dev',
        redirect: { name: 'admin-dev-list' },
        meta: { title: '开发管理', isDev: true, icon: 'code-box-fill' },
        children: [
          {
            path: 'icon',
            name: 'admin-dev-icon',
            component: () => import('@/views/admin/dev/icon/index.vue'),
            meta: { title: '图标大全', icon: 'icon-fill' },
          },
        ],
      },
    ],
  },
]

export default ADMIN_ROUTES

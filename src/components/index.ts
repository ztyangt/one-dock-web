import type { App } from 'vue'

import SvgIcon from '@/components/SvgIcon/index.vue'

// 注册全局组件
export default function (app: App) {
  app.component('SvgIcon', SvgIcon)
}

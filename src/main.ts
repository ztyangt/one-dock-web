import App from './App.vue'
import router from './router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import directives from '@/directives/index'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { RegisterComponents, RegisterDirectives } from '@wiit/vue3-helper'
import RegisterGlobalComponents from '@/components'
import { installPlugins } from '@/plugins'
import 'virtual:svg-icons-register'
import '@/assets/styles/arco.scss'
import '@/assets/styles/main.scss'
import '@wiit/vue3-helper/dist/index.css' // 引入基础样式
import '@wiit/vue3-helper/dist/fonts.css' // 引入字体样式
import '@wiit/vue3-helper/dist/remix.css' // 引入图标样式

const app = createApp(App)

const pinia = createPinia()
pinia.use(createPersistedState())

app
  .use(pinia)
  .use(router)
  .use(RegisterComponents)
  .use(RegisterGlobalComponents)
  .use(RegisterDirectives)
  .use(directives)
  .use(installPlugins)
  .mount('#app')

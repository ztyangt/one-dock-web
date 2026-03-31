import App from './App.vue'
import router from './router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import directives from '@/directives/index'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { RegisterComponents, RegisterDirectives } from '@wiit/vue3-helper'
import RegisterGlobalComponents from '@/components'
import { installPlugins } from '@/plugins'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primevue/themes'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import 'primeicons/primeicons.css'
import 'virtual:svg-icons-register'
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
  .use(ToastService)
  .use(ConfirmationService)
  .use(PrimeVue, {
    ripple: true,
    theme: {
      preset: definePreset(Aura, {
        semantic: {
          // 提取的品牌色 (Tailwind Sky 色系)
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9', // 核心蓝
            600: '#0284c7', // 亮色文本色
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
            950: '#082f49',
          },
          colorScheme: {
            light: {
              // 提取的基础色 (Tailwind Slate 色系)
              surface: {
                0: '#ffffff',
                50: '#f8fafc', // 你的 var(--color-bg)
                100: '#f1f5f9', // 你的 var(--color-tag)
                200: '#e2e8f0', // 你的 var(--color-border)
                300: '#cbd5e1',
                400: '#94a3b8', // var(--color-footer-closing)
                500: '#64748b', // var(--color-text-muted)
                600: '#475569',
                700: '#334155', // var(--color-headline-end)
                800: '#1e293b',
                900: '#0f172a', // var(--color-text-main)
                950: '#020617',
              },
            },
            dark: {
              surface: {
                0: '#ffffff',
                50: '#f8fafc', // var(--color-text-main) 暗黑模式
                100: '#f1f5f9',
                200: '#e2e8f0',
                300: '#cbd5e1',
                400: '#94a3b8', // var(--color-text-muted) 暗黑模式
                500: '#64748b',
                600: '#475569',
                700: '#334155',
                800: '#1e293b', // var(--color-logo-bg) 暗黑模式
                900: '#0f172a',
                950: '#131d31', // var(--color-bg) 暗黑模式
              },
            },
          },
        },
        // 2. 覆盖组件级别的样式（实现玻璃拟态和圆角）
        components: {
          card: {
            colorScheme: {
              light: {
                root: {
                  background: '#39bef8', // var(--color-panel)
                  color: '#0f172a',
                },
              },
              dark: {
                root: {
                  background: '#39bef8', // 暗色 var(--color-panel)
                  color: '#f8fafc',
                },
              },
            },
          },
        },
      }),
      options: {
        // 默认是 'system' (跟随系统)，要手动切换需指定类名
        darkModeSelector: '.dark',
        cssLayer: false,
      },
    },
  })
  .use(RegisterComponents)
  .use(RegisterGlobalComponents)
  .use(RegisterDirectives)
  .use(directives)
  .use(installPlugins)
  .mount('#app')

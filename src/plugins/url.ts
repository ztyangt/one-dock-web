import type { App } from 'vue'
import { useSystemStore } from '@/stores/system'

export function getUrl(url?: string) {
  const system = useSystemStore()
  return system.getUrl(url)
}

export default {
  install(app: App) {
    app.config.globalProperties.$URL = getUrl
  }
}

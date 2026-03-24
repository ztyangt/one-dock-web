import type { App } from 'vue'
import urlPlugin from './url'

// 插件列表
export const plugins = [urlPlugin]

// 安装插件
export function installPlugins(app: App) {
  plugins.forEach((plugin) => plugin.install(app))
}

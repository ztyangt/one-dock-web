import type { App } from 'vue'

const modules = import.meta.glob('./modules/**/*.ts', { eager: true })

const directives = {
  install: function (app: App<Element>) {
    for (const path in modules) {
      const module = (modules[path] as any).default
      if (!module) continue
      const directiveName = path.split('/')[2]
      directiveName && app.directive(directiveName, module)
    }
  }
}

export default directives

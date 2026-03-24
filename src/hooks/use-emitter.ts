import { SystemEmitter, ApiEmitter, RouterEmitter } from '@/emitter'
import { Message } from '@arco-design/web-vue'
import Router from '@/router'

export const useEmitter = () => {
  const userStore = useUserStore()
  const systemStore = useSystemStore()
  const configStore = useConfigStore()

  // api 响应错误
  ApiEmitter.on('API:RESPONSE-ERROR', (msg: string) => {
    Message.error(msg === 'Network Error' ? '网络错误!' : msg)
  })

  // 登录失效
  ApiEmitter.on('API:LOGIN-EXPIRED', () => {
    Message.info('登录失效,请重新登录!')
    userStore.logout()
  })

  // api 请求错误
  ApiEmitter.on('API:BAD-REQUEST', (msg: string) => {
    // Message.error(msg)
    Message.error({
      content: msg === 'Network Error' ? '网络错误!' : msg
    })
  })

  // 未安装
  ApiEmitter.on('API:NOT-INSTALL', (msg: string) => {
    userStore.logout()
    configStore.clear()
    systemStore.clear()
    Router.replace({ name: 'install' })
  })

  // api 未找到
  ApiEmitter.on('API:NOT-FOUND', (msg: string) => {
    Message.error(msg)
  })

  // api 请求错误
  ApiEmitter.on('API:INTERNAL-SERVER-ERROR', () => {
    Message.error('服务器错误!')
  })

  ApiEmitter.on('API:REQUEST-ERROR', (msg?: string) => {
    Message.error(msg || '请求错误!')
  })

  // 获取系统配置失败 - 无服务
  SystemEmitter.on('SYSTEM:SITE-FAILED', () => {
    Router.replace({ name: 'no-service' })
  })

  onBeforeUnmount(() => {
    ApiEmitter.clear()
    RouterEmitter.clear()
  })
}

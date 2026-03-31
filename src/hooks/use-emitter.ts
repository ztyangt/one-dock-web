import { SystemEmitter, ApiEmitter, RouterEmitter } from '@/emitter'
import { useToast } from 'primevue/usetoast'
import Router from '@/router'

export const useEmitter = () => {
  const toast = useToast()

  const userStore = useUserStore()
  const systemStore = useSystemStore()
  const configStore = useConfigStore()

  // api 响应错误
  ApiEmitter.on('API:RESPONSE-ERROR', (msg: string) => {
    // Message.error(msg === 'Network Error' ? '网络错误!' : msg)
    toast.add({
      severity: 'error',
      summary: msg === 'Network Error' ? '网络错误!' : msg,
      life: 2000,
    })
  })

  // 登录失效
  ApiEmitter.on('API:LOGIN-EXPIRED', () => {
    toast.add({
      severity: 'info',
      summary: '登录过期,请重新登录!',
      life: 2000,
    })
    userStore.logout()
  })

  // api 请求错误
  ApiEmitter.on('API:BAD-REQUEST', (msg: string) => {
    toast.add({
      severity: 'error',
      summary: msg === 'Network Error' ? '网络错误!' : msg,
      life: 2000,
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
    toast.add({
      severity: 'error',
      summary: '未找到资源!',
      life: 2000,
    })
  })

  // api 请求错误
  ApiEmitter.on('API:INTERNAL-SERVER-ERROR', () => {
    toast.add({
      severity: 'error',
      summary: '服务器错误!',
      life: 2000,
    })
  })

  ApiEmitter.on('API:REQUEST-ERROR', (msg?: string) => {
    toast.add({
      severity: 'error',
      summary: '请求失败!',
      life: 2000,
    })
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

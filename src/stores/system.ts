import { defineStore } from 'pinia'
import { systemApi } from '@/apis'

type SystemInfo = {
  description: string
  domain: string
  version: string
  name: string
}

export const useSystemStore = defineStore(
  'systemStore',
  () => {
    const isMobile = ref(true) // 是否为移动端
    const isInstall = ref(true) // 是否已经安装
    const system = ref<SystemInfo>() // 系统信息

    const toggleDevice = (value?: boolean) => {
      isMobile.value = value ?? !isMobile.value
    }

    // 获取系统信息
    const getSystemInfo = async () => {
      const { code, data } = await systemApi.systemInfo()
      if (code === 200) {
        system.value = data
        isInstall.value = true
      } else if (code === 501) isInstall.value = false
    }

    // 计算资源url
    const getUrl = (url?: string) => {
      if (!url) return ''
      if (url.startsWith('http') || !system.value?.domain) return url
      return new URL(url, `${system.value?.domain || ''}`).href
    }

    const clear = () => {
      isInstall.value = false
      system.value = undefined
    }

    return {
      clear,
      isMobile,
      isInstall,
      system,
      getSystemInfo,
      toggleDevice,
      getUrl
    }
  },
  {
    persist: [
      {
        key: 'SYSTEM-STORE',
        pick: ['isMobile'],
        storage: localStorage
      },
      {
        key: 'SYSTEM-STORE-SYSTEM',
        pick: ['system'],
        storage: sessionStorage
      }
    ]
  }
)

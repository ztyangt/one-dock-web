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
    const system = ref<SystemInfo>() // 系统信息

    // 获取系统信息
    const getSystemInfo = async () => {
      const { code, data } = await systemApi.systemInfo()
      if (code === 200) {
        system.value = data
      }
    }

    // 计算资源url
    const getUrl = (url?: string) => {
      if (!url) return ''
      if (url.startsWith('http') || !system.value?.domain) return url
      return new URL(url, `${system.value?.domain || ''}`).href
    }

    const clear = () => {
      system.value = undefined
    }

    return {
      clear,
      system,
      getSystemInfo,
      getUrl,
    }
  },
  {
    persist: [
      {
        key: 'SYSTEM-STORE-SYSTEM',
        pick: ['system'],
        storage: sessionStorage,
      },
    ],
  },
)

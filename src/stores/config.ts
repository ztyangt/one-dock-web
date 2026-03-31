import type { ConfigType } from '@/types/config'

const CONFIG_KEY = 'SYSTEM-CONFIG'

type Config = {
  title: string
  logo: string
  description: string
  favicon: string
}

export const useConfigStore = defineStore(
  'config-store',
  () => {
    const config = ref<Partial<Config>>({})
    const hasConfig = ref(false)

    // 获取配置
    const getConfig = async () => {
      if (hasConfig.value) return
      const { code, data } = await configApi.take<ConfigType.Datum<Config>>({
        config_key: CONFIG_KEY,
      })
      if (code === 200) {
        config.value = data.value
        hasConfig.value = true
      }
    }

    // 更新配置
    const updateConfig = async (val: Record<string, any>) => {
      const { code } = await configApi.update({
        config_key: CONFIG_KEY,
        value: { ...config.value, ...val },
      })
      if (code === 200) {
        config.value = { ...config.value, ...val }
        hasConfig.value = true
      }
    }

    const clear = () => {
      config.value = {}
      hasConfig.value = false
    }

    return { getConfig, clear, updateConfig, config, hasConfig }
  },
  {
    persist: [
      // {
      //   key: 'CONFIG-STORE',
      //   pick: ['config', 'system', 'hasConfig'],
      //   storage: sessionStorage
      // }
    ],
  },
)

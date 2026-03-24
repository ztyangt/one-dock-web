import { Emitter } from '@wiit/vue3-helper'

const eventNameList = [
  'SYSTEM:SITE-FAILED', // 获取站点配置失败
  'SYSTEM:SITE-SUCCESS', // 获取站点配置成功
] as const

export const SystemEmitter = new Emitter([...eventNameList])

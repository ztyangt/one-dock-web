import { Emitter } from '@wiit/vue3-helper'

const eventNameList = [
  'USER:NOT-LOGIN', // 未登录
  'USER:LOGIN-EXPIRE', // 登录过期
] as const

export const UserEmitter = new Emitter([...eventNameList])

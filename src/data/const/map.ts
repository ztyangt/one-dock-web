import { CommEnum } from '../enum/comm'

type CommMapValue<T> = {
  label: string
  value: T
  color: string
}

const createCommMap = <T extends string>(
  enumValues: T[],
  labels: string[],
  colors: string[]
): Record<T, CommMapValue<T>> => {
  const map: Record<T, CommMapValue<T>> = {} as Record<T, CommMapValue<T>>
  enumValues.forEach((value, index) => {
    map[value] = { label: labels[index] ?? '', value, color: colors[index] ?? '' }
  })
  return map
}

export const GenderMap: Record<any, any> = {
  1: {
    label: '男',
    color: '#409EFF'
  },
  2: {
    label: '女',
    color: '#fc4d93'
  },
  3: {
    label: '密',
    color: '#909399'
  }
}

export const RestfulMethodColorMap: Record<any, any> = {
  GET: 'green',
  POST: 'orangered',
  PUT: 'arcoblue',
  DELETE: 'red',
  PATCH: 'pinkpurple',
  HEAD: 'purple',
  OPTIONS: 'gray'
}

/**
 * 链接跳转类型映射
 */
export const TargetMap = createCommMap(
  Object.values(CommEnum.Target),
  ['新窗口', '本窗口'],
  ['#1890ff', '#ef8432']
)

export const MethodMap = createCommMap(
  Object.values(CommEnum.MethodType),
  ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  ['#17a95f', '#ed5d1d', '#2985f9', '#ee3c31', '#eb3db4', '#6e57b8', '#5667f1']
)

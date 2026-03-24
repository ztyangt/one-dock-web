export type NumberOrString = number | string

export interface ReturnId {
  id: NumberOrString
}

export interface Ids {
  ids: number[]
}

export interface Pagination<T> {
  page_num: number
  total: number
  records: T[]
}

export interface CommDatum {
  id: NumberOrString
  remark: string
  created_at: number
  updated_at: number
  deleted_at: number
}

export type WeatherType = {
  name: string
  icon: string
  icon_url: string
  value: number
}

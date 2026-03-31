import http from '@/utils/request'
import type { Pagination, ReturnId, Ids } from '@/types/comm'

export class BaseApi {
  private apiPrefix: string = '/api/'

  constructor(target: string) {
    this.apiPrefix += target
  }

  /**
   * 获取指定数据
   */
  take<T>(params: any) {
    return http.$get<T>(`${this.apiPrefix}`, params)
  }

  /**
   * 获取列表数据
   * @param params 查询参数
   */
  list<T>(params: any) {
    return http.$get<Pagination<T>>(`${this.apiPrefix}/list`, params)
  }

  /**
   * 获取所有数据
   * @param params 查询参数
   */
  all<T>(params?: any) {
    return http.$get<T[]>(`${this.apiPrefix}/all`, params)
  }

  /**
   * 创建数据
   * @param params 创建参数
   */
  create<T>(params: any) {
    return http.$post<ReturnId>(`${this.apiPrefix}`, params)
  }

  /**
   * 更新数据
   * @param params 更新参数
   */
  update(params: any) {
    return http.$patch<ReturnId>(`${this.apiPrefix}`, params)
  }

  /**
   * 保存数据
   * @param params 保存参数
   */
  save(params: any) {
    return params.id ? this.update(params) : this.create(params)
  }

  /**
   * 恢复数据
   * @param ids 数据id列表
   */
  restore(ids: number[]) {
    return http.$patch<Ids>(`${this.apiPrefix}/restore`, { ids })
  }

  /**
   * 移除数据
   * @param ids 数据id列表
   */
  remove(ids: number[]) {
    return http.$delete<Ids>(`${this.apiPrefix}/remove`, { ids })
  }

  /**
   * 删除数据
   * @param ids 数据id列表
   */
  delete(id: any) {
    return http.$delete(`${this.apiPrefix}`, { id })
  }

  deleteBatch(params: { ids: number[] }) {
    return http.$delete<Ids>(`${this.apiPrefix}/batch`, params)
  }
}

export type BaseApiType<T> = InstanceType<typeof BaseApi>

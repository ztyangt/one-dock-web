import http from '@/utils/request'
import type { Pagination, ReturnId, Ids } from '@/types/comm'

class StorageStrategyApi {
  private apiPrefix: string = '/api/storage-strategy'

  list<T>(params?: any) {
    return http.$get<Pagination<T>>(`${this.apiPrefix}/list`, params)
  }

  all<T>(params?: any) {
    return http.$get<T[]>(`${this.apiPrefix}/all`, params)
  }

  take<T>(params: any) {
    return http.$get<T>(`${this.apiPrefix}`, params)
  }

  create<T>(params: any) {
    return http.$post<ReturnId>(`${this.apiPrefix}`, params)
  }

  update(params: any) {
    return http.$patch<ReturnId>(`${this.apiPrefix}`, params)
  }

  delete(ids: Ids) {
    return http.$delete<ReturnId>(`${this.apiPrefix}`, ids)
  }

  testConnection(params: any) {
    return http.$post<{ success: boolean; message: string }>(
      `${this.apiPrefix}/test-connection`,
      params,
    )
  }
}

export const storageStrategyApi = new StorageStrategyApi()

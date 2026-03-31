import http from '@/utils/request'
import type { UserType } from '@/types'
import { BaseApi } from '../base'

class UserApi extends BaseApi {
  /**
   * 登录
   * @param params 登录参数 { account, password }
   * @returns
   */
  login(params: any) {
    return http.$post<UserType.UserLoginInfo>('/api/user/login', params)
  }
}

export const userApi = new UserApi('user')

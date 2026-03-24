import http from '@/utils/request'
import type { UserType } from '@/types'

class UserApi extends BaseApi<UserType.Datum> {
  login(params: any) {
    return http.$post('/api/user/login', params)
  }
}

export const userApi = new UserApi('user')

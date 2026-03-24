import { UserEnum } from '@/data'
import type { CommDatum } from './comm'

export namespace UserType {
  export interface Datum extends CommDatum {
    account: string
    nickname: string
    avatar: string
    description?: string
    email: string
    login_at: number
    last_ip: string
    login_count: number
    status: UserEnum.Status
    gender: UserEnum.Gender
    login_ip: string
    password: string
  }

  export type UserInfo = {
    id: number
    uid: string
    nickname: string
    email: string
    avatar: string
    description: string
    gender: UserEnum.Gender
  }

  export type JwtData = {
    exp: number
    iat: number
    iss: string
    sub: string
    data: {
      role: number
      uid: string
    }
  }
}

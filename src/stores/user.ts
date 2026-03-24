import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserType } from '@/types/user'
import { Message } from '@arco-design/web-vue'
import { jwtDecode } from 'jwt-decode'
import Router from '@/router'
import Cookies from 'js-cookie'
import { userApi } from '@/apis/modues/user'

export const useUserStore = defineStore(
  'user-store',
  () => {
    const loading = ref(false)
    const token = ref<string>()
    const user = ref<UserType.UserInfo>()

    const hasLogin = computed(() => {
      return !!token.value && !!user.value
    })

    //  初始化用户信息，检查token是否过期
    const init = () => {
      if (token.value) {
        const payload = jwtDecode<UserType.JwtData>(token.value)
        if (payload.exp < Date.now()) {
          Message.warning('登录过期，请重新登录！')
          logout()
        }
      }
    }

    // 登录
    const login = async (account: string, password: string) => {
      loading.value = true

      const { code, data } = await userApi.login({ account, password })
      loading.value = false
      if (code === 200) {
        Message.success('登录成功！')
        token.value = data.token
        user.value = data.user

        // const systemStore = useSystemStore()

        // Cookies.set('Authorization', token.value || '', {
        //   path: '/',
        //   expires: 3600 * 12
        // })

        if (Router.currentRoute.value.query.redirect) {
          Router.replace(decodeURIComponent(Router.currentRoute.value.query.redirect as string))
        } else {
          Router.replace({ name: 'Admin' })
        }
      }
    }

    const logout = () => {
      token.value = undefined
      user.value = undefined
      Cookies.remove('Authorization', { path: '/' })
      Router.replace({
        name: 'login',
        query: { redirect: encodeURIComponent(Router.currentRoute.value.fullPath) }
      })
    }

    return {
      loading,
      token,
      user,
      hasLogin,
      init,
      login,
      logout
    }
  },
  {
    persist: [
      {
        key: 'USER-STORE',
        pick: ['user', 'token', 'no'],
        storage: localStorage
      }
    ]
  }
)

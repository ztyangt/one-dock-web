import type { InternalAxiosRequestConfig, AxiosInstance } from 'axios'

export const reqInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const userStore = useUserStore()
      config.headers['Authorization'] = userStore.token
      return config
    },
    (error: any) => {
      return Promise.reject(error)
    },
  )
}

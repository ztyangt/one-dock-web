import { useConfigStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

export const useDocumentHead = () => {
  const configStore = useConfigStore()

  const { config } = storeToRefs(configStore)

  const setFavicon = () => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null
    if (link) {
      link.href = config.value?.favicon || ''
    } else {
      const faviconElement = document.createElement('link')
      faviconElement.rel = 'shortcut icon'
      faviconElement.href = config.value?.favicon || ''
      document.head.appendChild(faviconElement)
    }
  }

  setFavicon()

  watch(
    () => config.value?.favicon,
    () => {
      setFavicon()
    },
  )
}

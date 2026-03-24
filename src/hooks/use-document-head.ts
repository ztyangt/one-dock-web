import { useConfigStore } from '@/stores/config'
import { useSystemStore } from '@/stores/system'
import { storeToRefs } from 'pinia'

export const useDocumentHead = () => {
  const configStore = useConfigStore()
  const { getUrl } = useSystemStore()

  const { config } = storeToRefs(configStore)

  const setFavicon = () => {
    const favicon = getUrl(config.value?.favicon || '')
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null
    if (link) {
      link.href = favicon
    } else {
      const faviconElement = document.createElement('link')
      faviconElement.rel = 'shortcut icon'
      faviconElement.href = favicon
      document.head.appendChild(faviconElement)
    }
  }

  // setFavicon()

  watch(
    () => config.value?.favicon,
    () => {
      // setFavicon()
    },
  )
}

import { createApp } from 'vue'
import type { Directive } from 'vue'
import { ImagePreviewGroup, ImagePreview } from '@arco-design/web-vue'

declare global {
  interface HTMLImageElement {
    _eventHandler?: (e: Event) => void
  }
}

function handlePreviewImage(el: HTMLElement, e: Event) {
  if (el.getAttribute('no-preview') === 'true') return
  const imgNodeList = el.parentElement?.querySelectorAll('img:not([no-preview])')
  if (!imgNodeList?.length) return

  const div = document.createElement('div')
  document.body.appendChild(div)

  if (imgNodeList.length === 1) {
    const imgUrl = (imgNodeList[0] as HTMLImageElement).src
    const app = createApp(ImagePreview, {
      defaultVisible: true,
      escToClose: true,
      src: imgUrl,
      onClose: () => {
        app.unmount()
        div.remove()
      }
    })
    app.mount(div)
  } else {
    let current = 0

    const target = e.target as HTMLImageElement
    if (target.tagName !== 'IMG') return

    // 判断点击的图片是哪一张，并设置当前显示的图片索引
    for (let i = 0; i < imgNodeList.length; i++) {
      if (imgNodeList[i] === e.target) {
        current = i
        break
      }
    }

    const imgList = Array.from(imgNodeList).map((node) => (node as HTMLImageElement).src)

    const app = createApp(ImagePreviewGroup, {
      defaultVisible: true,
      infinite: true,
      escToClose: true,
      srcList: imgList,
      defaultCurrent: current,
      onClose: () => {
        app.unmount()
        div.remove()
      }
    })
    app.mount(div)
  }
}

const ImgPreview: Directive = {
  mounted(el: HTMLImageElement) {
    el._eventHandler = (e: Event) => handlePreviewImage(el, e)
    el.addEventListener('click', el._eventHandler)
  },
  beforeUnmount(el: HTMLImageElement) {
    if (el._eventHandler) {
      el.removeEventListener('click', el._eventHandler)
      delete el._eventHandler
    }
  }
}

export default ImgPreview

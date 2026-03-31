import type { Directive, DirectiveBinding } from 'vue'
import { useToast } from 'primevue/usetoast'
interface ElType extends HTMLElement {
  copyData: string | number
  __handleClick__: any
}

function handleClick(this: any) {
  const input = document.createElement('input')
  input.style.opacity = '0'
  input.value = this.copyData.toLocaleString()
  document.body.appendChild(input)
  input.select()
  document.execCommand('Copy')
  document.body.removeChild(input)
  const toast = useToast()

  toast.add({ severity: 'info', summary: '复制成功', detail: '已成功复制' })
}

export default {
  mounted(el: ElType, binding: DirectiveBinding) {
    el.copyData = binding.value
    el.addEventListener('click', handleClick)
  },
  updated(el: ElType, binding: DirectiveBinding) {
    el.copyData = binding.value
  },
  beforeUnmount(el: ElType) {
    el.removeEventListener('click', el.__handleClick__)
  },
}

<script setup lang="ts">
import { useEmitter } from '@/hooks/use-emitter'
import { useDocumentHead } from '@/hooks/use-document-head'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()

const init = async () => {
  useEmitter()
  await systemStore.getSystemInfo()
  useDocumentHead()
}

init()
</script>

<template>
  <RouterView />
</template>

<style></style>

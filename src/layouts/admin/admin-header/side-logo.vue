<template>
  <div class="admin-side-logo flex-yc pointer" @click="() => router.push({ name: 'Admin' })">
    <img v-if="config?.logo" class="logo-img" :src="config.logo" alt="logo" />
    <div class="logo-text fs-24 fw-700 ml-10 title-color">{{ config?.title || 'ADMIN' }}</div>
  </div>
</template>

<script setup lang="ts">
import { useConfigStore } from '@/stores/config'

const { config } = storeToRefs(useConfigStore())

const router = useRouter()
</script>

<style lang="scss" scoped>
.logo-img {
  height: 30px;
}
</style>

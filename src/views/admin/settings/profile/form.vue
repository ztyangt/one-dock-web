<template>
  <div></div>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash'
import type { UserType } from '@/types/user'

const userStore = useUserStore()

const user = ref<Partial<UserType.UserInfo>>(cloneDeep(userStore.user || {}))
</script>

<style lang="scss" scoped></style>

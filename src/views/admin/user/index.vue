<template>
  <div class="user-management-page wh-100 p-15 flex-column">
    <user-table class="flex-1 w-100 h-0" />
  </div>
</template>

<script setup lang="ts">
import UserTable from './user-table/index.vue'
import { useCommTable } from '@/hooks/use-comm-table'
import type { UserType } from '@/types'

const hooks = useCommTable<UserType.Datum>({ api: userApi, order: 'created_at asc' })
provide('hooks', hooks)
</script>

<style lang="scss" scoped></style>

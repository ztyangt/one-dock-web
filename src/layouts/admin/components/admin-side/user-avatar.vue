<template>
  <a-avatar
    :size="size || 32"
    :auto-fix-font-size="true"
    :style="{ backgroundColor: 'var(--theme-color)' }"
    :image-url="user?.avatar"
    class="flex-shrink-0"
  >
    {{ user?.nickname }}
    <template v-if="edit" #trigger-icon>
      <IconEdit />
    </template>
  </a-avatar>
</template>

<script setup lang="ts">
const { user } = storeToRefs(useUserStore())

defineProps<{
  edit?: boolean
  size?: number
}>()
</script>

<style lang="scss" scoped></style>

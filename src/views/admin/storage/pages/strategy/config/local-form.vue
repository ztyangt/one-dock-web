<template>
  <a-form-item
    label="存储路径"
    field="config.path"
    :rules="[{ required: true, message: '请输入存储路径' }]"
  >
    <a-input v-model="config.path" placeholder="请输入存储路径" allow-clear />
  </a-form-item>
</template>

<script setup lang="ts">
const config = defineModel<any>('config', { default: {} })
</script>

<style lang="scss" scoped></style>

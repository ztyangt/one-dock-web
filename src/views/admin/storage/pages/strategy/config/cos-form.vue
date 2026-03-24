<template>
  <a-divider class="mt-5 mb-15" />
  <!-- <a-form-item
    label="存储桶名称"
    field="config.bucket"
    :rules="[{ required: true, message: '请输入存储桶名称' }]"
  >
    <a-input v-model="config.bucket" placeholder="请输入存储桶名称" allow-clear> </a-input>
    <template #extra>
      前往
      <a-link class="fs-12" target="_blank" href="https://console.cloud.tencent.com/cos/bucket"
        >COS 管理控制台</a-link
      >
      创建存储桶，将 <span class="text-color">「存储桶名称」</span> 填写到上方。
    </template>
  </a-form-item> -->
  <a-form-item
    label="存储桶访问域名"
    field="config.domain"
    :rules="[{ required: true, message: '请输入访问域名' }]"
  >
    <a-input v-model="config.domain" placeholder="请输入访问域名" allow-clear> </a-input>
    <template #extra>
      存储桶访问域名可以在 COS 控制台
      <span class="text-color">「存储桶概览」</span> 查看
    </template>
  </a-form-item>
  <a-form-item
    label="访问凭证"
    field="config.secret_id"
    :rules="[{ required: true, message: '请输入 SecretId' }]"
  >
    <a-input v-model="config.secret_id" placeholder="请输入 SecretId" allow-clear> </a-input>
  </a-form-item>
  <a-form-item
    label="访问凭证"
    hide-label
    field="config.secret_key"
    :rules="[{ required: true, message: '请输入 SecretKey' }]"
  >
    <a-input v-model="config.secret_key" placeholder="请输入 SecretKey" allow-clear> </a-input>
    <template #extra>
      访问凭证可在腾讯云
      <a-link class="fs-12" target="_blank" href="https://console.cloud.tencent.com/cam/capi"
        >访问密钥</a-link
      >
      页面获取，请确保这对密钥拥有 COS 服务的访问权限。
    </template>
  </a-form-item>
</template>

<script setup lang="ts">
const config = defineModel<any>('config', { default: {} })
</script>

<style lang="scss" scoped></style>

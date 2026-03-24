<template>
  <a-divider class="mt-5 mb-15" />
  <a-form-item
    label="存储桶名称"
    field="config.bucket"
    :rules="[{ required: true, message: '请输入存储桶名称' }]"
  >
    <a-input v-model="config.bucket" placeholder="请输入存储桶名称" allow-clear> </a-input>
    <template #extra>
      前往
      <a-link class="fs-12" target="_blank" href="https://oss.console.aliyun.com/bucket"
        >OSS 管理控制台</a-link
      >
      创建存储桶，将 <span class="text-color">「存储桶名称」</span> 填写到上方。
    </template>
  </a-form-item>
  <a-form-item
    label="地域节点"
    field="config.endpoint"
    :rules="[{ required: true, message: '请输入地域节点' }]"
  >
    <a-select
      @change="handleEndpointChange"
      v-model="config.endpoint"
      placeholder="请选择地域节点"
      allow-clear
      allow-search
    >
      <a-option v-for="item in oss_endpoint_options" :key="item.value" :value="item.value">
        {{ item.label }}
      </a-option>
    </a-select>
    <template #extra>
      转到所创建的 Buket 概览页面， 在
      <span class="text-color">「基本信息」</span> 栏目下的
      <span class="text-color">「地域」</span> 中查看 EndPoint（地域节点）。
    </template>
  </a-form-item>

  <a-form-item
    label="访问凭证"
    field="config.access_id"
    :rules="[{ required: true, message: '请输入 AccessKey Id' }]"
  >
    <a-input v-model="config.access_id" placeholder="请输入 AccessKey Id" allow-clear> </a-input>
  </a-form-item>
  <a-form-item
    label="访问凭证"
    hide-label
    field="config.access_secret"
    :rules="[{ required: true, message: '请输入 AccessKey Secret' }]"
  >
    <a-input v-model="config.access_secret" placeholder="请输入 AccessKey Secret" allow-clear>
    </a-input>
    <template #extra>
      可在阿里云
      <a-link
        class="fs-12"
        target="_blank"
        href="https://ram.console.aliyun.com/profile/access-keys"
        >安全信息管理</a-link
      >
      页面获取 AccessKey，你也可以在
      <a-link class="fs-12" target="_blank" href="https://ram.console.aliyun.com/ram/overview"
        >RAM访问控制</a-link
      >
      中创建拥有 <span class="text-color">「AliyunOSSFullAccess」</span> 权限的 AccessKey。
    </template>
  </a-form-item>
</template>

<script setup lang="ts">
import { oss_endpoint_options } from '@/data/const/option'

const config = defineModel<any>('config', { default: {} })

const handleEndpointChange = (val: string) => {
  const item = oss_endpoint_options.find((it) => it.value === val)
  if (item) {
    config.value.region = item.region
  }
}
</script>

<style lang="scss" scoped></style>

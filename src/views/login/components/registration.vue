<template>
  <div>
    <a-form ref="formRef" :model="formModel" :rules="rules" autocomplete="off">
      <a-form-item field="social" hide-label validate-trigger="blur">
        <a-input v-model="formModel.social" placeholder="请输入邮箱或手机" allow-clear>
          <template #prefix>
            <icon-shake />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item field="account" hide-label validate-trigger="blur">
        <a-input v-model="formModel.account" placeholder="请输入账号" allow-clear>
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item field="nickname" hide-label validate-trigger="blur">
        <a-input v-model="formModel.nickname" placeholder="请输入昵称" allow-clear>
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item field="password" hide-label validate-trigger="blur">
        <a-input-password
          autocomplete="false"
          v-model="formModel.password"
          placeholder="请输入密码"
          allow-clear
        >
          <template #prefix>
            <icon-unlock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item field="re_password" hide-label validate-trigger="blur">
        <a-input-password
          autocomplete="false"
          v-model="formModel.re_password"
          placeholder="请确认密码"
          allow-clear
          @keyup.enter="handleUpdate"
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item field="code" hide-label validate-trigger="blur">
        <a-input v-model="formModel.code" placeholder="验证码" allow-clear search-button>
          <template #prefix>
            <icon-safe />
          </template>
          <template #append>
            <a-link
              class="text-color"
              :loading="codeLoading"
              :disabled="codeLoading || cutdown !== 60"
              @click="handleSendCode"
              >{{ cutdown === 60 ? '获取验证码' : `${cutdown}s` }}</a-link
            >
          </template>
        </a-input>
      </a-form-item>

      <a-form-item field="inviteCode" hide-label validate-trigger="blur">
        <a-input v-model="formModel.inviteCode" placeholder="请输入邀请码" allow-clear>
          <template #prefix>
            <icon-down-circle />
          </template>
        </a-input>
      </a-form-item>
    </a-form>

    <a-button :loading="loading" @click="handleUpdate" class="w-100 mt-10" type="primary">
      提交注册
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const isDev = import.meta.env.MODE === 'development'

const loading = ref(false)
const codeLoading = ref(false)
const cutdown = ref(60)

const formRef = ref()
const formModel = ref({
  social: isDev ? 'hello@123.com' : undefined,
  account: isDev ? 'hello' : undefined,
  nickname: isDev ? '相左' : undefined,
  password: isDev ? '123456' : undefined,
  re_password: isDev ? '123456' : undefined,
  code: undefined,
  inviteCode: undefined,
})

const handleSendCode = async () => {
  // 验证邮箱
  const valid = await formRef.value?.validateField('social')
  if (valid) return
  // 发送验证码
  codeLoading.value = true
  const { code, msg } = await commApi.signUp(formModel.value)
  codeLoading.value = false
  if (code === 201) {
    Message.success(msg || '验证码已发送')
    cutdown.value = 59
    const timer = setInterval(() => {
      if (cutdown.value > 0) cutdown.value--
      else {
        clearInterval(timer)
        cutdown.value = 60
      }
    }, 1000)
  }
}

const emits = defineEmits(['success'])
const handleUpdate = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) {
    const { code } = await commApi.signUp({ ...formModel.value })

    if (code === 200) {
      emits('success')
      Message.success('注册成功，自动登录！')
    }
  }
}

const rules = {
  social: [{ required: true, message: '邮箱或手机不能为空' }],
  nickname: [{ required: true, message: '昵称不能为空' }],
  account: [{ required: true, message: '账号不能为空' }],
  password: [
    { required: true, message: '密码不能为空' },
    { maxLength: 32, message: '密码长度不能大于32位' },
    { minLength: 6, message: '密码长度不能少于6位' },
  ],
  re_password: [
    { required: true, message: '请确认新密码' },
    { maxLength: 32, message: '密码长度不能大于32位' },
    { minLength: 6, message: '密码长度不能少于6位' },
    {
      validator: (value: string, cb: any) => {
        if (value !== formModel.value.password) {
          return cb('两次密码不一致')
        } else {
          cb()
        }
      },
    },
  ],
}
</script>

<style lang="scss" scoped></style>

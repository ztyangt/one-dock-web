<template>
  <div>
    <a-form ref="formRef" :model="formModel" :rules="rules" autocomplete="off">
      <a-form-item field="social" hide-label validate-trigger="blur">
        <a-input v-model="formModel.social" placeholder="请输入邮箱或手机" allow-clear>
          <template #prefix>
            <icon-email />
          </template>
        </a-input>
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
      <a-form-item field="password" hide-label validate-trigger="blur">
        <a-input-password
          autocomplete="false"
          v-model="formModel.password"
          placeholder="新密码"
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
          placeholder="确认新密码"
          allow-clear
          @keyup.enter="handleUpdate"
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
    </a-form>

    <a-button :loading="loading" @click="handleUpdate" class="w-100 mt-10" type="primary">
      提交修改
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
  social: isDev ? 'admin@123.com' : undefined,
  code: undefined,
  password: isDev ? '123456' : undefined,
  re_password: isDev ? '123456' : undefined,
})

const handleSendCode = async () => {
  const valid = await formRef.value?.validateField('social')
  if (valid) return
  // 发送验证码
  codeLoading.value = true
  const { code, msg } = await commApi.resetPwd({ ...formModel.value })
  codeLoading.value = false
  if (code === 201) {
    Message.success(msg || '验证码已发送！')
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
    // 更新密码
    const { code } = await commApi.resetPwd({ ...formModel.value })
    if (code === 200) {
      Message.success('密码更新成功,请重新登录！')
    }
  }
}

const rules = {
  social: [{ required: true, message: '邮箱或手机号不能为空' }],
  code: [{ required: true, message: '验证码不能为空' }],
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

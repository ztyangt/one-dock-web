<template>
  <a-modal
    class="user-dialog-wrap"
    v-model:visible="visible"
    status="info"
    title-align="start"
    draggable
    unmount-on-close
    width="600px"
    :mask-closable="false"
    :ok-loading="loading"
    :on-before-ok="handleSubmit"
  >
    <template #title>
      <div v-if="formModel.id" class="flex-yc">
        <icon-edit class="mr-5" size="18" /> <span>编辑用户</span>
      </div>
      <div v-else class="flex-yc">
        <icon-plus-circle class="mr-5" size="18" /> <span>创建用户</span>
      </div>
    </template>
    <a-form
      layout="horizontal"
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-align="right"
      autocomplete="off"
      auto-label-width
    >
      <div class="flex-yc mt-10">
        <div class="flex-1">
          <a-form-item field="nickname" label="昵称">
            <a-input v-model="formModel.nickname" placeholder="请输入用户昵称" allow-clear>
              <template #prefix><icon-pen /> </template>
            </a-input>
          </a-form-item>

          <a-form-item field="account" label="账号">
            <a-input
              v-model.trim="formModel.account"
              :max-length="32"
              placeholder="请输入账号"
              allow-clear
              show-word-limit
            >
              <template #prefix><icon-user /> </template>
            </a-input>
          </a-form-item>

          <a-form-item field="email" label="邮箱">
            <a-input v-model="formModel.email" placeholder="请输入邮箱" allow-clear>
              <template #prefix><icon-email /> </template>
            </a-input>
          </a-form-item>
        </div>
        <image-upload
          path="user/avatars/"
          style="width: 120px; height: 120px; aspect-ratio: 1/1"
          class="br-50 overhide flex-shrink-0 ml-20 mb-20"
          v-model="formModel.avatar"
          :icon-size="28"
          text="点击上传头像"
        />
      </div>

      <div class="flex-yc w-100">
        <a-form-item class="flex-1" field="gender" label="性别">
          <a-radio-group v-model="formModel.gender" type="button" size="small">
            <a-radio :value="UserEnum.Gender.BOY">男生</a-radio>
            <a-radio :value="UserEnum.Gender.GIRL">女生</a-radio>
            <a-radio :value="UserEnum.Gender.UNKNOW">保密</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item
          class="flex-shrink-0 ml-10 flex-1"
          field="status"
          style="min-width: 112px"
          label="状态"
        >
          <a-switch
            v-model="formModel.status"
            type="round"
            :checked-value="UserEnum.Status.BANNED"
            :unchecked-value="UserEnum.Status.NORMAL"
            checked-color="rgb(var(--red-6))"
            unchecked-color="rgb(var(--green-5))"
          >
            <template #unchecked> 正常 </template>
            <template #checked> 封禁 </template>
          </a-switch>
        </a-form-item>
      </div>

      <div class="flex-yc">
        <a-form-item field="avatar" label="头像">
          <a-input v-model="formModel.avatar" placeholder="请输入图片地址" allow-clear>
            <template #prefix><icon-image /> </template>
          </a-input>
        </a-form-item>
      </div>

      <a-form-item field="password" label="密码">
        <a-input-password
          v-model="formModel.password"
          :max-length="32"
          placeholder="请输入密码"
          allow-clear
        >
          <template #prefix><icon-lock /> </template>
        </a-input-password>
      </a-form-item>

      <a-form-item field="describe" label="简介">
        <a-textarea
          v-model="formModel.description"
          placeholder="请输入简介..."
          :max-length="500"
          show-word-limit
          auto-size
          allow-clear
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { UserEnum } from '@/data/enum/user'
import type { UserType } from '@/types'
import { Message } from '@arco-design/web-vue'

const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const formModel = ref<Partial<UserType.Datum>>({})

const emits = defineEmits<{
  (e: 'success'): void
}>()

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) return false
  const { code } = await userApi.save(formModel.value)
  if (code === 200) {
    emits('success')
    Message.success('操作成功！')
    return true
  }
  return false
}

const openExpose = (data?: UserType.Datum) => {
  formModel.value = data || {}

  visible.value = true
}

const rules: Record<string, any> = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { maxLength: 32, message: '长度不能超过32字符', trigger: 'blur' },
    { minLength: 4, message: '长度不能少于4字符', trigger: 'blur' }
  ],
  email: [
    // { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

defineExpose({ open: openExpose })
</script>

<style lang="scss" scoped>
.arco-textarea-wrapper {
  min-height: 60px;
}
</style>

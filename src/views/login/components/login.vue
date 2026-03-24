<template>
  <div>
    <a-form ref="formRef" :model="formModel" :rules="rules" autocomplete="off">
      <a-form-item field="email" hide-label validate-trigger="blur">
        <a-input v-model="formModel.account" placeholder="请输入邮箱" allow-clear>
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
          @keyup.enter="methods.handleLogin"
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
    </a-form>

    <a-button :loading="userStore.loading" @click="methods.handleLogin" class="w-100 my-15" type="primary">
      <template #icon><c-icon :size="15" name="login-box-line" /></template>
      提交登录
    </a-button>
    <!-- <a-divider style="margin-top: 30px" orientation="center">
      <span class="secondary-color fs-12">社交账号登录</span>
    </a-divider> -->

    <!-- <div class="flex-center mt-30">
      <div class="flex-yc g-20">
        <svg-icon
          @click="handleScoialLogin('qq')"
          class="br-50 pointer social-icon"
          name="qq"
          size="24"
        />
        <svg-icon
          @click="handleScoialLogin('wechat')"
          class="pointer social-icon"
          name="wechat"
          size="24"
        />
        <svg-icon
          @click="handleScoialLogin('github')"
          class="pointer social-icon"
          name="github"
          size="24"
        />
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();

const formRef = ref();
const formModel = ref({
  account: import.meta.env.DEV ? "admin" : undefined,
  password: import.meta.env.DEV ? "123456" : undefined,
});

const rules = {
  account: [
    {
      required: true,
      message: "账号或邮箱不能为空",
    },
  ],
  password: [
    {
      required: true,
      message: "密码不能为空",
    },
  ],
};

const methods = {
  handleLogin: () => {
    formRef.value?.validate(async (valid: any) => {
      if (!valid) {
        userStore.login(formModel.value.account!, formModel.value.password!);
      }
    });
  },
};
</script>

<style lang="scss" scoped>
.social-icon {
  &:hover {
    box-shadow: var(--shadow);
  }
}
</style>

<template>
  <div class="login-page wh-100 flex-center">
    <div class="login-card card-bg">
      <header class="top-strip flex-yc w-100 flex-sb">
        <div class="flex-yc">
          <img class="logo-box flex-center p-5" :src="config?.logo" />
          <span class="brand-name ml-10">{{ config?.title }}</span>
        </div>
        <button
          @click="toggleTheme"
          class="theme-btn flex-center"
          id="theme-toggle"
          title="切换主题"
        >
          {{ !isDark ? '🌙' : '☀️' }}
        </button>
      </header>

      <main class="login-content">
        <div class="login-header">
          <h1 class="login-title">欢迎回来</h1>
          <p class="login-subtitle mt-10">{{ config?.description }}</p>
        </div>

        <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmit">
          <div style="height: 70px">
            <FloatLabel>
              <InputText name="account" type="text" fluid />
              <label for="over_label">账号&邮箱</label>
            </FloatLabel>
            <div class="fs-13 error-color" v-if="$form.account?.invalid">
              {{ $form.account.error?.message }}
            </div>
          </div>
          <div style="height: 70px">
            <FloatLabel>
              <InputText name="password" type="password" fluid />
              <label for="over_label">登录密码</label>
            </FloatLabel>
            <div class="fs-13 error-color" v-if="$form.password?.invalid">
              {{ $form.password.error?.message }}
            </div>
          </div>
          <Button
            class="mt-40 w-100"
            :loading="loading"
            icon="pi pi-sign-in"
            type="submit"
            label="登录"
          />
        </Form>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useConfigStore } from '@/stores/config'
import { useTheme } from '@wiit/vue3-helper'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const { isDark, toggleTheme } = useTheme()
const { config } = storeToRefs(useConfigStore())

const loading = ref(false)

const initialValues = reactive({
  account: '',
  password: '',
})

const resolver = ({ values }: any) => {
  const errors: any = {}
  if (!values.account) errors.account = [{ message: '账号不能为空！' }]
  if (!values.password) errors.password = [{ message: '密码不能为空！' }]
  return { values, errors }
}

const onFormSubmit = async ({ valid, values }: any) => {
  if (!valid) return
  loading.value = true
  await userStore.login(values)
  loading.value = false
}
</script>

<style lang="scss">
.login-page {
  .login-card {
    width: 90%;
    max-width: 440px;
    background: var(--color-panel);
    backdrop-filter: blur(24px);
    border-radius: 24px;
    box-shadow: var(--shadow-panel), var(--highlight-panel);
    border: 1px solid var(--color-border);
    overflow: hidden;
    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease,
      background-color 0.4s ease,
      border-color 0.4s ease;

    .top-strip {
      border-bottom: 1px solid var(--color-border);
      padding: 1rem 1.8rem;
      gap: 0.8rem;
      background: var(--color-strip);
      transition:
        background-color 0.4s ease,
        border-color 0.4s ease;

      .logo-box {
        background: var(--color-logo-bg);
        border-radius: 10px;
        width: 36px;
        height: 36px;
        box-shadow: var(--shadow-logo);
        border: 1px solid var(--color-logo-border);
        font-size: 1.2rem;
        transition:
          background-color 0.4s ease,
          border-color 0.4s ease;
      }

      .brand-name {
        font-weight: 600;
        font-size: 1.1rem;
        letter-spacing: -0.01em;
      }

      .theme-btn {
        &:hover {
          color: var(--color-text-main);
          transform: rotate(15deg) scale(1.1);
        }
      }
    }
  }

  .login-content {
    padding: 2.5rem 2.5rem 3rem 2.5rem;

    .login-header {
      text-align: center;
      margin-bottom: 3.5rem;
    }

    .login-title {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(
        135deg,
        var(--color-headline-start) 0%,
        var(--color-headline-end) 100%
      );
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      margin-bottom: 0.5rem;
    }

    .login-subtitle {
      font-size: 0.95rem;
      color: var(--color-text-muted);
    }

    .form-group {
      margin-bottom: 1.2rem;
    }

    .form-label {
      display: block;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-main);
      margin-bottom: 0.5rem;
    }
  }
}
</style>

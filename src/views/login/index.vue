<template>
  <div class="z-999 login-page-wrap card-bg relative pt-30 pb-40 px-40 br-3 no-select relative">
    <div class="flex-yc mb-30">
      <img v-if="config?.logo" :src="$URL(config?.logo)" class="login-logo mr-10" />
      <div class="login-title w-100 my-0 title-color fs-20 fw-500">
        <div class="flex-yc flex-sb w-100">
          <div class="fs-24 youshe">欢迎回来！</div>
          <theme-btn :size="25" />
        </div>
      </div>
    </div>

    <a-tabs :active-key="tabKey" @tab-click="tabKey = $event" animation>
      <a-tab-pane key="login" title="登录">
        <login class="mt-20" />
      </a-tab-pane>
      <a-tab-pane key="registration" title="注册">
        <registration class="mt-10" />
      </a-tab-pane>
      <a-tab-pane key="reset" title="找回密码">
        <ResetPwd class="mt-10" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import Login from './components/login.vue'
import Registration from './components/registration.vue'
import ResetPwd from './components/reset-pwd.vue'

const { config } = storeToRefs(useConfigStore())
const tabKey = ref('login')
</script>

<style lang="scss">
.login-page-wrap {
  width: 90%;
  max-width: 430px;
  backdrop-filter: blur(2px);
  background-color: rgb(255 255 255 / 60%);

  .theme-btn {
    top: 20px;
    right: 20px;
    position: absolute !important;
  }

  .login-form {
    width: 100%;
    padding: 40px 30px;
    border-radius: 8px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }

  .login-logo {
    height: 32px;
  }

  .theme-btn {
    top: 20px;
    right: 20px;
  }
}
</style>

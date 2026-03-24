<template>
  <div class="p-10 admin-side-user-card" v-if="user">
    <div v-ripple class="user-card br-5 p-10">
      <div class="flex mb-10">
        <UserAvatar :edit="true" />

        <!-- <div class="flex-column flex-sa ml-10">
          <div class="user-name fs-14 fw-500 h-1x break-all">{{ user.nickname }}</div>
          <div class="fs-12 h-1x secondary-color break-all">{{ user.account }}</div>
        </div> -->
      </div>

      <a-divider class="my-5" />

      <div class="flex-column jc-around br-5" style="height: 32px">
        <div class="flex-sb fs-12" style="line-height: 1">
          <span class="fw-500 secondary-color">新手</span>
          <span class="secondary-color">入门</span>
        </div>
        <a-progress :percent="0.8" animation :show-text="false" status="normal" :stroke-width="5" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from './user-avatar.vue'

const { user } = storeToRefs(useUserStore())
</script>

<style lang="scss">
.admin-side-user-card {
  .user-card {
    background-color: var(--secondary-bg);

    .arco-avatar-trigger-icon-button {
      background-color: var(--card-bg);
      box-shadow: var(--shadow);
    }
  }
}
</style>

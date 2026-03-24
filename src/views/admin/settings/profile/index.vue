<template>
  <div class="settings-profile-page p-15">
    <div class="card-bg p-20 br-5">
      <div class="setting-profile-form">
        <Avatar />
        <Form />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from './avatar.vue'
import Form from './form.vue'
</script>

<style lang="scss" scoped>
.setting-profile-form {
  margin: 0 auto;
  width: 600px;
}
</style>

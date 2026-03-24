<template>
  <div class="profile-avatar-wrap flex-center">
    <div class="text-center">
      <div @click="handleSelectAvatar" class="profile-avatar flex-center br-50 relative pointer">
        <img class="wh-100 br-50 absolute inset-0" :src="avatar" v-if="avatar" />
        <c-icon name="camera-fill" color="var(--text-color)" :size="30" />
      </div>

      <div class="mt-15 fs-12 text-color-2">点击修改头像</div>
    </div>

    <a-modal
      v-model:visible="visible"
      @ok="handleOk"
      @cancel="visible = false"
      title-align="start"
      :render-to-body="false"
    >
      <template #title> 修改头像 </template>
      <div ref="cropperContainer" class="image-cropper-wrap">
        <vue-cropper
          ref="cropper"
          outputType="png"
          info
          autoCrop
          fixed
          centerBox
          infoTrue
          :fixedBox="false"
          img="https://p3-pc.douyinpic.com/aweme/1080x1080/aweme-avatar/tos-cn-avt-0015_2f07496a52314c3e024eaafaba73dd35.jpeg"
        >
        </vue-cropper>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { useFileSelect } from '@wiit/vue3-helper'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'

// https://github.xyxiao.cn/vue-cropper/
// https://vue-cropper.vercel.app/#/methods

const visible = ref(false)
const userStore = useUserStore()
const avatar = ref(userStore.user?.avatar || '')

const { selectFile } = useFileSelect()

const cropperContainer = ref<HTMLDivElement>()

const handleSelectAvatar = async () => {
  const files = await selectFile({ accept: ['image/*'] })
  if (files.length > 0) {
    visible.value = true

    const image = new Image()

    image.src = URL.createObjectURL(files[0]!)
  }
}

const handleOk = async () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.profile-avatar {
  height: 100px;
  width: 100px;
  background-color: var(--secondary-bg);
}
.image-cropper-wrap {
  height: 250px;
  width: 250px;
  margin: 0 auto;
}

cropper-canvas {
  width: 100%;
  height: 100% !important;
}
</style>

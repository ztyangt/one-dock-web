<template>
  <div class="side-logo-wrap flex-center">
    <div class="flex-center px-10">
      <div class="flex-center g-5 relative w-100 pointer" @click="router.push('/')">
        <div class="flex-center w-100">
          <div class="flex-yc">
            <img :src="getUrl(config?.logo)" v-if="config?.logo" class="side-logo" />
            <div v-if="!isMobile" class="title-color h-1x youshe fw-500 ml-5 fs-24">
              {{ config?.title }}
            </div>
          </div>
        </div>
        <div
          v-if="false"
          class="icon-color absolute ml-20 shrink-btn pointer z-3 card-bg light-border fw-600 theme-hover br-5 shadow flex-center show-md"
          style="padding: 2px"
          :style="{ right: '-22px', height: '22px', width: '22px' }"
          @click.stop="sysStore.toggleDevice()"
        >
          <c-icon :name="isMobile ? 'indent-increase' : 'indent-decrease'" size="16" />
        </div>
      </div>
    </div>

    <!-- <div class="flex-center" :class="{ 'px-20': !isMobile }">
      <a-button type="primary" class="br-5 w-100" :class="{ 'mobile-btn': isMobile }">
        <template #icon>
          <icon-plus />
        </template>
        <template #default v-if="!isMobile"> <span>发布文章</span> </template>
      </a-button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const sysStore = useSystemStore()
const { isMobile } = storeToRefs(sysStore)

const configStore = useConfigStore()
const { config } = storeToRefs(configStore)

const { getUrl } = useSystemStore()
</script>

<style lang="scss" scoped>
.side-logo {
  height: 28px;
}

.mobile-btn {
  height: 32px;
  width: 32px;
}

.side-logo-wrap {
  height: 60px;
}

.float-right {
  position: absolute;
  right: -32px;
  display: none;
  @include respond-to('md') {
    display: block;
  }
}
</style>

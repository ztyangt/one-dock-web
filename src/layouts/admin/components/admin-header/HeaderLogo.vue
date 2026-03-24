<template>
  <div class="header-logo flex-yc no-select">
    <img
      v-if="config?.logo"
      class="logo-img mr-5"
      :src="getUrl(config?.logo)"
      :alt="config?.title"
    />
    <div class="logo-text fs-24 title-color youshe">{{ config?.title }}</div>
  </div>
</template>

<script setup lang="ts">
const { config } = storeToRefs(useConfigStore())
const { getUrl } = useSystemStore()
</script>

<style lang="scss" scoped>
.logo-img {
  height: 28px;
}
</style>

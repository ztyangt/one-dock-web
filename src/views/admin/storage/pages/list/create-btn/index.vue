<template>
  <div class="file-create-wrap">
    <a-dropdown position="br" trigger="hover">
      <a-button class="card-bg">
        <icon-plus />
        <span class="ml-5">创建</span>
      </a-button>

      <template #content>
        <ContextMenu />
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import ContextMenu from '../context-menu/index.vue'
</script>

<style lang="scss"></style>

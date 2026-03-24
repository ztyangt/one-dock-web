<template>
  <a-dropdown>
    <a-button class="card-bg">
      <icon-apps />
      <span class="ml-5">视图</span>
    </a-button>
    <template #content>
      <a-doption>
        <div class="flex-yc"><c-icon class="mr-5" name="layout-grid-line" />网格</div>
      </a-doption>
      <a-doption>
        <div class="flex-yc"><c-icon class="mr-5" name="list-check" />列表</div>
      </a-doption>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped></style>

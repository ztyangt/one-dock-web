<template>
  <a-dropdown position="tr">
    <a-button class="fixed-upload-btn" type="primary" shape="circle" size="large">
      <icon-plus />
    </a-button>

    <template #content>
      <a-dgroup title="上传">
        <a-doption @click="handleSelect('file')">
          <template #icon>
            <c-icon name="file-upload-line" />
          </template>
          <span>上传文件</span>
        </a-doption>
        <a-doption @click="handleSelect('folder')">
          <template #icon> <c-icon name="folder-upload-line" /> </template>
          <span>上传目录</span>
        </a-doption>
      </a-dgroup>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { useFileSelect } from "@wiit/vue3-helper";
import { useFileUploadStore } from "../../../stores/file-upload";

const { selectFile, selectFolder } = useFileSelect();
const { addFile } = useFileUploadStore();

const route = useRoute();

const handleSelect = async (type: "file" | "folder") => {
  let result: FileList | null = null;
  if (type === "file") {
    result = await selectFile();
  } else if (type === "folder") {
    result = await selectFolder();
  }
  if (result) addFile(result, route.query.folder as string);
};
</script>

<style lang="scss" scoped>
.fixed-upload-btn {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 999;
}
</style>

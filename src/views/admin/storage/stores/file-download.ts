import { defineStore } from "pinia";
import { FileUploadStatus } from "@/data/enum/file";

type DownloadFileItem = {
  file: File;
  uuid: string;
  status: FileUploadStatus;
  hash?: string;
  progress: number;
};

export const useFileUploadStore = defineStore("file-download", () => {
  const uploadList = ref<DownloadFileItem[]>([]);

  return {
    uploadList,
  };
});

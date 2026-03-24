// 文件上传状态
export enum FileUploadStatus {
  PREPARING = 0, // 准备中
  AWAITING = 1, // 等待
  UPLOADING = 2, // 上传中
  PAUSE = 3, // 已暂停
  CANCEL = 4, // 已取消
  FAILED = 5, // 上传失败
  COMPELETE = 6 // 上传完成
}

export enum FileEnumType {
  FILE = 1, // 文件
  FOLDER = 2 // 文件夹
}

export enum StrategyEnumType {
  LOCAL = 'local', // 本地存储
  S3 = 's3', // S3存储
  COS = 'cos', // 腾讯云COS
  OSS = 'oss', // 阿里云OSS
  KODO = 'kodo', // 七牛云Kodo
  UPYUN = 'upyun', // 又拍云
  OBS = 'obs' // 华为云OBS
}

import CryptoJS from 'crypto-js'

/**
 * AES对称加密
 */
export class AES {
  iv: any
  key: any

  constructor(key: string, iv: string) {
    this.iv = CryptoJS?.enc.Utf8.parse(iv)
    this.key = CryptoJS?.enc.Utf8.parse(key)
  }

  // 加密
  encrypt(text: string) {
    let encrypted = CryptoJS?.AES.encrypt(text, this.key, {
      iv: this.iv,
      mode: CryptoJS?.mode.CBC,
      padding: CryptoJS?.pad.Pkcs7
    })
    return encrypted.toString()
  }

  // 解密
  decrypt(text: string) {
    let decrypted = CryptoJS?.AES.decrypt(text, this.key, {
      iv: this.iv,
      mode: CryptoJS?.mode.CBC,
      padding: CryptoJS?.pad.Pkcs7
    })
    return decrypted.toString(CryptoJS?.enc.Utf8)
  }
}

/**
 * 生成指定长度的加密字符串
 * @param value 字符串值
 * @param length 长度
 * @param prefix 前缀
 */
export const Token = (value = '', length = 32, prefix = '') => {
  // 计算MD5哈希值
  const MD5Hash = CryptoJS.MD5(prefix + value).toString()

  let result = MD5Hash.substring(0, length)

  // 计算 result 长度是否满足要求
  while (result.length < length) {
    result += Token(result, length - result.length)
  }

  return result
}

// 根据ASCII排序
export const ASCII = (params: any) => {
  const keys = Object.keys(params).sort()

  let item = ''
  keys.forEach((key) => {
    const val = params[key]
    if (key.length > 0 && String(val).length > 0) {
      item += `${key}=${val}&`
    }
  })

  if (item.length > 0) item = item.slice(0, -1)

  return item
}

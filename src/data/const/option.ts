import { StrategyEnumType } from '@/data/enum/file'

export const open_options = [
  { label: '开启', value: true },
  { label: '关闭', value: false }
]

export const dispaly_options = [
  { label: 'fullscreen', value: 'fullscreen' },
  { label: 'standalone', value: 'standalone' },
  { label: 'minimal-ui', value: 'minimal-ui' },
  { label: 'browser', value: 'browser' }
]

export const allow_register_options = [
  { label: '允许注册', value: '1' },
  { label: '禁止注册', value: '0' }
]

export const auth_root_options = [
  { label: '管理(可操作他人数据)', value: 1 },
  { label: '默认(仅操作自己数据)', value: 0 }
]

export const request_api_type = [
  { label: '默认', value: 'default' },
  { label: '公共', value: 'common' },
  { label: '登录', value: 'login' }
]

export const request_options = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' }
]

export const request_type_tag = {
  GET: 'success',
  PUT: 'primary',
  POST: 'warning',
  DELETE: 'danger'
}

export const link_target_options = [
  { label: '新窗口', value: '_blank' },
  { label: '当前窗口', value: '_self' }
]

export const gender_options = [
  { label: '男', value: 'boy' },
  { label: '女', value: 'girl' },
  { label: '保密', value: '' }
]

export const bool_num_options = [
  { label: '是', value: 1 },
  { label: '否', value: 0 }
]

export const auth_options = [
  { label: '公开', value: 'everyone' },
  { label: '自己可见', value: 'me' },
  { label: '登录可见', value: 'login' },
  { label: '密码可见', value: 'password' }
]

export const audit_options = [
  { label: '待审核', value: 0 },
  { label: '通过', value: 1 },
  { label: '不通过', value: 2 }
]

export const allow_options = [
  // { label: '继承父级', value: 0 },
  { label: '允许评论', value: 1 },
  { label: '禁止评论', value: 2 }
]

export const show_options = [
  // { label: '继承父级', value: 0 },
  { label: '显示', value: 1 },
  { label: '隐藏', value: 2 }
]

export const kodo_region_options = [
  { value: 'z0', label: '华东' },
  { value: 'z1', label: '华北河北' },
  { value: 'z2', label: '华南广东' },
  { value: 'na0', label: '北美' },
  { value: 'as0', label: '新加坡' },
  { value: 'cn-east-2', label: '华东浙江' },
  { value: 'ap-northeast-1', label: '亚太-首尔机房' }
]

export const oss_endpoint_options = [
  { value: 'oss-cn-hangzhou.aliyuncs.com', label: '华东1（杭州）', region: 'cn-hangzhou' },
  { value: 'oss-cn-shanghai.aliyuncs.com', label: '华东2（上海）', region: 'cn-shanghai' },
  { value: 'oss-cn-nanjing.aliyuncs.com', label: '华东5（南京-本地地域）', region: 'cn-nanjing' },
  { value: 'oss-cn-qingdao.aliyuncs.com', label: '华北1（青岛）', region: 'cn-qingdao' },
  { value: 'oss-cn-beijing.aliyuncs.com', label: '华北2（北京）', region: 'cn-beijing' },
  { value: 'oss-cn-zhangjiakou.aliyuncs.com', label: '华北3（张家口）', region: 'cn-zhangjiakou' },
  { value: 'oss-cn-huhehaote.aliyuncs.com', label: '华北5（呼和浩特）', region: 'cn-huhehaote' },
  { value: 'oss-cn-wulanchabu.aliyuncs.com', label: '华北6（乌兰察布）', region: 'cn-wulanchabu' },
  { value: 'oss-cn-shenzhen.aliyuncs.com', label: '华南1（深圳）', region: 'cn-shenzhen' },
  { value: 'oss-cn-heyuan.aliyuncs.com', label: '华南2（河源）', region: 'cn-heyuan' },
  { value: 'oss-cn-guangzhou.aliyuncs.com', label: '华南3（广州）', region: 'cn-guangzhou' },
  { value: 'oss-cn-chengdu.aliyuncs.com', label: '西南1（成都）', region: 'cn-chengdu' },
  { value: 'oss-cn-hongkong.aliyuncs.com', label: '中国香港', region: 'cn-hongkong' },
  { value: 'oss-ap-northeast-1.aliyuncs.com', label: '日本（东京）', region: 'ap-northeast-1' },
  { value: 'oss-ap-northeast-2.aliyuncs.com', label: '韩国（首尔）', region: 'ap-northeast-2' },
  { value: 'oss-ap-southeast-1.aliyuncs.com', label: '新加坡', region: 'ap-southeast-1' },
  {
    value: 'oss-ap-southeast-3.aliyuncs.com',
    label: '马来西亚（吉隆坡）',
    region: 'ap-southeast-3'
  },
  {
    value: 'oss-ap-southeast-5.aliyuncs.com',
    label: '印度尼西亚（雅加达）',
    region: 'ap-southeast-5'
  },
  { value: 'oss-ap-southeast-6.aliyuncs.com', label: '菲律宾（马尼拉）', region: 'ap-southeast-6' },
  { value: 'oss-ap-southeast-7.aliyuncs.com', label: '泰国（曼谷）', region: 'ap-southeast-7' },
  { value: 'oss-eu-central-1.aliyuncs.com', label: '德国（法兰克福）', region: 'eu-central-1' },
  { value: 'oss-eu-west-1.aliyuncs.com', label: '英国（伦敦）', region: 'eu-west-1' },
  { value: 'oss-us-west-1.aliyuncs.com', label: '美国（硅谷）', region: 'us-west-1' },
  { value: 'oss-us-east-1.aliyuncs.com', label: '美国（弗吉尼亚）', region: 'us-east-1' },
  { value: 'oss-na-south-1.aliyuncs.com', label: '墨西哥', region: 'na-south-1' },
  { value: 'oss-me-east-1.aliyuncs.com', label: '阿联酋（迪拜）', region: 'me-east-1' },
  {
    value: 'oss-me-central-1.aliyuncs.com',
    label: '沙特（利雅得）- 合作伙伴运营',
    region: 'me-central-1'
  }
]

export const cos_region_options = [
  { value: 'ap-beijing-1', label: '北京一区', area: '中国大陆' },
  { value: 'ap-beijing', label: '北京', area: '中国大陆' },
  { value: 'ap-nanjing', label: '南京', area: '中国大陆' },
  { value: 'ap-shanghai', label: '上海', area: '中国大陆' },
  { value: 'ap-guangzhou', label: '广州', area: '中国大陆' },
  { value: 'ap-chengdu', label: '成都', area: '中国大陆' },
  { value: 'ap-chongqing', label: '重庆', area: '中国大陆' },
  { value: 'ap-shenzhen-fsi', label: '深圳金融', area: '中国大陆' },
  { value: 'ap-shanghai-fsi', label: '上海金融', area: '中国大陆' },
  { value: 'ap-beijing-fsi', label: '北京金融', area: '中国大陆' },
  { value: 'ap-hongkong', label: '中国香港', area: '亚太' },
  { value: 'ap-singapore', label: '新加坡', area: '亚太' },
  { value: 'ap-mumbai', label: '孟买', area: '亚太' },
  { value: 'ap-jakarta', label: '雅加达', area: '亚太' },
  { value: 'ap-seoul', label: '首尔', area: '亚太' },
  { value: 'ap-bangkok', label: '曼谷', area: '亚太' },
  { value: 'ap-tokyo', label: '东京', area: '亚太' },
  { value: 'na-siliconvalley', label: '硅谷（美西）', area: '北美' },
  { value: 'na-ashburn', label: '弗吉尼亚（美东）', area: '北美' },
  { value: 'na-toronto', label: '多伦多', area: '北美' },
  { value: 'sa-saopaulo', label: '圣保罗', area: '南美' },
  { value: 'eu-frankfurt', label: '法兰克福', area: '欧洲' }
]

export const strategy_options = [
  { label: '本地存储', value: StrategyEnumType.LOCAL },
  { label: '腾讯云COS', value: StrategyEnumType.COS },
  { label: '阿里云OSS', value: StrategyEnumType.OSS },
  { label: '华为云OBS', value: StrategyEnumType.OBS },
  { label: '七牛云Kodo', value: StrategyEnumType.KODO },
  { label: '又拍云', value: StrategyEnumType.UPYUN },
  { label: '亚马逊S3', value: StrategyEnumType.S3 }
]

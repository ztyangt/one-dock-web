import type { ConfigType } from '@/types'
import { BaseApi } from '../base'
/**
 * 配置API
 */
class ConfigApi extends BaseApi<ConfigType.Datum> {}

export const configApi = new ConfigApi('config')

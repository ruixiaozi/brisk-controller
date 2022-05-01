import { BriskOption } from 'brisk-ioc';


/**
 * InterceptorMappingOption
 * @description 拦截器路由选项
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 */
export interface InterceptorMappingOption extends BriskOption {
  path: string;
}

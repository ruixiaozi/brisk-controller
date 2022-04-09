import { BriskOption } from 'brisk-ioc';


/**
 * InterceptorMappingOption
 * @description 拦截器路由选项
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年04月09日 22:25:03
 * @version 3.0.0
 */
export interface InterceptorMappingOption extends BriskOption {
  path: string;
}

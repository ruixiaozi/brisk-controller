import { BriskOption } from 'brisk-ioc';

/**
 * InterceptorOption
 * @description 拦截器选项
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 */
export interface InterceptorOption extends BriskOption {
  // 路径
  path: string;
}

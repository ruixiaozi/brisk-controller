import { BriskOption } from 'brisk-ioc';

/**
 * InterceptorOption
 * @description 拦截器选项
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年04月09日 21:49:24
 * @version 3.0.0
 */
export interface InterceptorOption extends BriskOption {
  // 路径
  path: string;
}

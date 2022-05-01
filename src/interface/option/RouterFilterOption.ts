import { BriskOption } from 'brisk-ioc';

/**
 * RouterFilterOption
 * @description 拦截器选项接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 */
export interface RouterFilterOption extends BriskOption {
  path: string;
}

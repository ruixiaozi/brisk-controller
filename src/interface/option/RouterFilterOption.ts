import { BriskOption } from 'brisk-ioc';

/**
 * RouterFilterOption
 * @description 拦截器选项接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 22:27:15
 * @version 2.0.0
 */
export interface RouterFilterOption extends BriskOption {
  path: string;
}
import { MethodEnum } from '@enum';
import { BriskOption } from 'brisk-ioc';


/**
 * RequestMappingOption
 * @description 请求路由选项接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 */
export interface RequestMappingOption extends BriskOption {
  path: string;
  method: MethodEnum;
  name?: string;
  description?: string;
}

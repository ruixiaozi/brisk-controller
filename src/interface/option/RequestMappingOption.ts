import { MethodEnum } from '@enum';
import { BriskOption } from 'brisk-ioc';


/**
 * RequestMappingOption
 * @description 请求路由选项接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 22:26:59
 * @version 2.0.0
 */
export interface RequestMappingOption extends BriskOption {
  path: string;
  method: MethodEnum;
  name?: string;
  description?: string;
}

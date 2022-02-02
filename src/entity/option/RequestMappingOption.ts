import {
  IRequestMappingOption,
  Method,
} from "../../interface/option/IRequestMappingOption";

/**
 * RequestMappingOption
 * @description 请求路由选项
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 22:28:19
 * @version 2.0.0
 */
export class RequestMappingOption implements IRequestMappingOption {
  /**
   * 构造方法
   * @param path 路径
   * @param method 方法，默认值Method.All
   */
  constructor(public path: string, public method: Method = Method.All) {}
}

import { IOption } from "brisk-ioc";

export enum Method {
  All,
  POST,
  GET,
  PUT,
  DELETE,
}
/**
 * IRequestMappingOption
 * @description 请求路由选项接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 22:26:59
 * @version 2.0.0
 */
export interface IRequestMappingOption extends IOption {
  path: string;
  method: Method;
}

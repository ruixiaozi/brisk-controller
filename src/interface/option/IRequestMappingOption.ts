import { IOption } from 'brisk-ioc';

export enum Method {
  POST='post',
  GET='get',
  PUT='put',
  DELETE='delete',
}

export enum ParamTypeEnum{
  String='string',
  Number='number',
  Integer='integer',
  Boolean='boolean',
  Array='array',
  File='file',
}

export interface RuleDesc{
  type: ParamTypeEnum;
  required: boolean;
}

export interface RuleObject{
  [name: string]: RuleDesc | ParamTypeEnum;
}

export interface RuleCollection{
  header: RuleObject;
  query: RuleObject;
  formData: RuleObject;
  body: RuleObject;
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
  name?: string;
  description?: string;
  header?: RuleObject;
  query?: RuleObject;
  formData?: RuleObject;
  body?: RuleObject;
}

import { TypeKind } from 'brisk-ts-extends';
import { Request, Response, Context, Next } from 'koa';
import { BriskControllerSwaggerTag } from './swagger';

export interface BriskControllerOption {
  // 默认false
  cors?: boolean;
  // 默认 /
  globalBaseUrl?: string;
  // 默认不开启
  staticPath?: string;
  // swagger，默认不开启
  swagger?: boolean;
}

export enum BRISK_CONTROLLER_ROUTER_TYPE_E {
  INTERCEPTOR,
  REQUEST,
}

export interface BriskControllerRouter {
  type: BRISK_CONTROLLER_ROUTER_TYPE_E;
  handler: (ctx: Context, next: Next) => any;
}

export type BriskControllerRequestHandler = (...params: any[]) => any;

export type BriskControllerInterceptorHandler = (req: Request, res: Response) => boolean | void;

export interface BriskControllerValidatorResult {
  defaultTip: string;
  [key: string | number]: any;
}

export type BriskControllerValidator = (value: any) => { [key: string]: BriskControllerValidatorResult | null } | null;


export enum BRISK_CONTROLLER_METHOD_E {
  GET='get',
  POST='post',
  PUT='put',
  DELETE='delete',
}

export enum BRISK_CONTROLLER_PARAMETER_IS_E {
  IN_BODY='inBody',
  BODY='body',
  FORM_DATA='formData',
  QUERY='query',
  HEADER='header',
  PATH='path',
  FILE='file',
  COOKIE='cookie',
  NULL='null',
}

export interface BriskControllerParameter {
  name: string;
  is: BRISK_CONTROLLER_PARAMETER_IS_E;
  // 类型
  type: TypeKind;
  description?: string;
  required?: boolean;
  // 默认值
  default?: any;
  // 校验器
  validator?: BriskControllerValidator;
}


export interface BriskControllerInterceptorOption {
  // 默认为GET
  method?: BRISK_CONTROLLER_METHOD_E;
  // 基础地址，默认相对于globalBaseUrl的根路径
  baseUrl?: string;
}

export interface BriskControllerRequestOption extends BriskControllerInterceptorOption {
  // 操作名称，用于客户端生成接口调用方法名，保证同以tag下唯一
  name?: string;
  // 接口标题
  title?: string;
  // 描述
  description?: string;
  // 参数列表
  params?: BriskControllerParameter[];
  // 标签
  tag?: BriskControllerSwaggerTag;
  // 成功响应体类型，默认为any类型
  successResponseType?: TypeKind;
}


import { TypeKind } from 'brisk-ts-extends';
import { Request, Response, Context, Next } from 'koa';

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

export type BriskControllerValidator = (value: any) => { [key: string]: any | null } | null;


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
  description?: string;
  required?: boolean;
  // 类型
  type?: TypeKind;
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
  // 名称
  title?: string;
  // 描述
  description?: string;
  // 参数列表
  params?: BriskControllerParameter[];
  // 标签
  tag?: string;
}


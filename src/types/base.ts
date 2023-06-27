import { TypeKind } from 'brisk-ts-extends';
import { Context, Request, Response } from 'koa';
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

export type BriskControllerRouterHandler = (ctx: Context) => any;

export interface BriskControllerRouterOption {
  // 默认是request
  type?: BRISK_CONTROLLER_ROUTER_TYPE_E;
  // 默认是get
  method?: BRISK_CONTROLLER_METHOD_E | BRISK_CONTROLLER_METHOD_E[];
}

export interface BriskControllerHeaders {
  [key: string]: string;
}

export interface BriskControllerPathInfo {
  path: string;
  params?: any;
  methodMap?: Map<BRISK_CONTROLLER_METHOD_E, Map<BRISK_CONTROLLER_ROUTER_TYPE_E, BriskControllerRouterHandler[]>>;
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
  // 不需要赋值参数
  NULL = 'null',
  // 用于拦截器、转发请求传递数据
  STATE='state',
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
  method?: BRISK_CONTROLLER_METHOD_E | BRISK_CONTROLLER_METHOD_E[];
  // 基础地址，默认相对于globalBaseUrl的根路径
  baseUrl?: string;
}

export interface BriskControllerRedirectInfo {
  // 可能的跳转地址列表
  urls: string[];
  // 默认301
  status?: number;
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
  // 跳转信息，仅当返回redrect方法时
  redirect?: BriskControllerRedirectInfo;
}

export interface BriskControllerRedirect {
  _briskControllerRedirect: {
    targetPath: string;
    status: number;
  };
}

export interface BriskControllerCookieOption {

  /**
   * a number representing the milliseconds from Date.now() for expiry
   */
  maxAge?: number | undefined;

  /**
   * a Date object indicating the cookie's expiration
   * date (expires at the end of session by default).
   */
  expires?: Date | undefined;

  /**
   * a string indicating the path of the cookie (/ by default).
   */
  path?: string | undefined;

  /**
   * a string indicating the domain of the cookie (no default).
   */
  domain?: string | undefined;

  /**
   * a boolean indicating whether the cookie is only to be sent
   * over HTTPS (false by default for HTTP, true by default for HTTPS).
   */
  secure?: boolean | undefined;

  /**
   * "secureProxy" option is deprecated; use "secure" option, provide "secure" to constructor if needed
   */
  secureProxy?: boolean | undefined;

  /**
   * a boolean indicating whether the cookie is only to be sent over HTTP(S),
   * and not made available to client JavaScript (true by default).
   */
  httpOnly?: boolean | undefined;

  /**
   * a boolean or string indicating whether the cookie is a "same site" cookie (false by default).
   * This can be set to 'strict', 'lax', or true (which maps to 'strict').
   */
  sameSite?: 'strict' | 'lax' | 'none' | boolean | undefined;

  /**
   * a boolean indicating whether the cookie is to be signed (false by default).
   * If this is true, another cookie of the same name with the .sig suffix
   * appended will also be sent, with a 27-byte url-safe base64 SHA1 value
   * representing the hash of cookie-name=cookie-value against the first Keygrip key.
   * This signature key is used to detect tampering the next time a cookie is received.
   */
  signed?: boolean | undefined;

  /**
   * a boolean indicating whether to overwrite previously set
   * cookies of the same name (false by default). If this is true,
   * all cookies set during the same request with the same
   * name (regardless of path or domain) are filtered out of
   * the Set-Cookie header when setting this cookie.
   */
  overwrite?: boolean | undefined;
}

export interface BriskControllerResultFactory<T> {
  setCookie(key: string, value: string, option?: BriskControllerCookieOption): BriskControllerResultFactory<T>;

  setHeader(key: string, value: string): BriskControllerResultFactory<T>;

  toResult(): T;
}

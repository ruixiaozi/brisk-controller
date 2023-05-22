import { koaSwagger } from 'koa2-swagger-ui';
import { getLogger, LOGGER_LEVEL_E } from 'brisk-log';
import Koa, { Context } from 'koa';
import cors from 'koa-cors';
import staticMidware from 'koa-static';
import path from 'path';
import { Server } from 'http';
import { getPortPromise } from 'portfinder';
import {
  BriskControllerRequestHandler,
  BriskControllerOption,
  BriskControllerRequestOption,
  BriskControllerInterceptorOption,
  BRISK_CONTROLLER_METHOD_E,
  BriskControllerParameter,
  BRISK_CONTROLLER_PARAMETER_IS_E,
  BriskControllerInterceptorHandler,
  BRISK_CONTROLLER_ROUTER_TYPE_E,
  BriskControllerRedirect,
  BriskControllerResultFactory,
  BriskControllerCookieOption,
} from '../types';
import { isLike, TypeKind } from 'brisk-ts-extends';
import { get, getParentTypeKind, getSubTypeKind } from 'brisk-ts-extends/runtime';
import { addSwaggerRoute, addSwaggerTag, getSwaggerHandler, initSwaggerConfig } from './swagger';
import { isValid, parseBoolean } from './utils';
import { addRoute, BriskControllerError, initRouter, isFormData, isJson, router, setBaseUrl } from './router';


const defaultRegion = Symbol('briskController');
const logger = getLogger(defaultRegion);
logger.configure({
  // 默认是info级别，可通过配置全局来改变此等级
  level: LOGGER_LEVEL_E.info,
});

let server: Server;


/**
 * 抛出错误响应
 * @deprecated
 * @link BriskControllerError 可以抛出BriskControllerError异常代替此方法
 * @param status 状态码
 * @param msg 错误内容
 */
export function throwError(status: number, msg?: any): never {
  throw new BriskControllerError(status, msg);
}

/**
 * 路由跳转
 * @param targetPath 目标路由
 * @param status 状态码，默认301
 * @returns
 */
export function redirect(targetPath: string, status: number = 301): BriskControllerRedirect {
  return {
    _briskControllerRedirect: {
      targetPath,
      status,
    },
  };
}

/**
 * 路由转发
 * @param targetPath 目标路由
 * @param method 转发方法，默认get
 * @returns
 */
export async function forward<T>(targetPath: string, method = BRISK_CONTROLLER_METHOD_E.GET): Promise<T> {
  const res = await Promise.resolve({
    _briskControllerForward: {
      targetPath,
      method,
    },
  } as T);
  return res;
}

/**
 * 返回结果工程
 * @param result 返回对象
 * @returns 返回一个工厂对象
 */
export function resultFactory<T>(result: T): BriskControllerResultFactory<T> {
  if (result === undefined || result === null) {
    logger.error('resultFactory does not allow a null value');
    throw new Error();
  }
  if (typeof result !== 'object') {
    logger.error('resultFactory not a object value');
    throw new Error();
  }
  const cookies: any[] = [];
  const headers: any[] = [];
  return {
    setCookie(key: string, value: string, option?: BriskControllerCookieOption) {
      cookies.push({ key, value, option });
      return this;
    },
    setHeader(key: string, value: string) {
      headers.push({ key, value });
      return this;
    },
    toResult(): T {
      (result as any)._extra = {
        cookies,
        headers,
      };
      return result;
    },
  };
}

// 参数校验、参数类型转换
function validateAndTransParameter(param: BriskControllerParameter, value: any): any {
  if (!isValid(value) && param.required) {
    throwError(400, `param '${param.name}' required`);
  }

  if (!param.type) {
    return value;
  }

  if (param.type === 'Date') {
    const timestamp = Date.parse(value);
    // 无法转换成日期
    if (Number.isNaN(timestamp)) {
      throwError(400, `param '${param.name}' type error`);
    }
    return new Date(timestamp);
  }

  if (getParentTypeKind(param.type) === 'Array') {
    if (!Array.isArray(value)) {
      throwError(400, `param '${param.name}' type error`);
    }
    return value.map((item: any) => validateAndTransParameter({ ...param, type: getSubTypeKind(param.type) as TypeKind }, item));
  }

  if (['string', 'number', 'boolean'].includes(param.type)) {
    if (typeof value === param.type) {
      return value;
    }

    if (typeof value !== 'string') {
      throwError(400, `param '${param.name}' type error`);
    }
    switch (param.type) {
      case 'string':
        return value;
      case 'number':
        if (Number.isNaN(Number(value))) {
          throwError(400, `param '${param.name}' type error`);
        }
        return Number(value);
      case 'boolean':
        if (parseBoolean(value) === undefined) {
          throwError(400, `param '${param.name}' type error`);
        }
        return parseBoolean(value);
      default:
        return value;
    }
  }

  if (!isLike<any>(value, param.type)) {
    throwError(400, `param '${param.name}' type error`);
  }

  const typedes = get(param.type);

  // 枚举直接返回
  if (typedes.enums) {
    return value;
  }

  return typedes.properties.reduce((pre, current) => {
    pre[current.key] = value[current.key];
    return pre;
  }, {} as any);
}

function validateParameter(param: BriskControllerParameter, value: any) {
  if (!isValid(value) && !param.required) {
    return undefined;
  }
  const val = validateAndTransParameter(param, value);
  const error = param.validator?.(val);

  if (error && typeof error === 'object') {
    throwError(400, Object.values(error)?.[0]?.defaultTip);
  }

  return val;
}

function getParameters(ctx: Context, params?: BriskControllerParameter[]) {
  if (!params?.length) {
    return [];
  }

  const data: any = (ctx.request as any).body || {};

  return params.map((item) => {
    let value: any;
    switch (item.is) {
      case BRISK_CONTROLLER_PARAMETER_IS_E.IN_BODY:
        value = isJson(ctx) ? data[item.name] : undefined;
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.FORM_DATA:
        value = isFormData(ctx) ? data[item.name] : undefined;
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.BODY:
        value = isJson(ctx) ? data : undefined;
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.QUERY:
        value = ctx.request.query[item.name];
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.PATH:
        value = (ctx.request as any).pathParams?.[item.name];
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.HEADER:
        value = ctx.request.headers[item.name.toLowerCase()];
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.COOKIE:
        value = ctx.cookies.get(item.name);
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.STATE:
        // 直接返回state值，不需要校验
        return ctx.state?.[item.name];
      default:
        return undefined;
    }
    const val = validateParameter(item, value);
    return isValid(val) ? val : item.default;
  });
}

/**
 * 添加拦截器
 * @param requestPath 路径
 * @param fn 路由处理器
 * @param option 拦截器选项
 */
export function addInterceptor(requestPath: string, handler: BriskControllerInterceptorHandler, option?: BriskControllerInterceptorOption) {
  const routePath = path.posix.join(option?.baseUrl || '/', requestPath);
  addRoute(
    routePath,
    async(ctx: Context) => {
      logger.debug(`interceptor ${ctx.request.url}`, {
        type: ctx.request.type,
        data: (ctx.request as any).body,
        query: ctx.request.query,
        headers: ctx.request.headers,
      });
      const res = await Promise.resolve(handler(ctx.request, ctx.response));
      return res;
    },
    {
      method: option?.method,
      type: BRISK_CONTROLLER_ROUTER_TYPE_E.INTERCEPTOR,
    },
  );
}

/**
 * 添加Request
 * @param requestPath 路径
 * @param handler 请求处理器
 * @param option 路由选项
 */
export function addRequest(requestPath: string, handler: BriskControllerRequestHandler, option?: BriskControllerRequestOption) {
  const routePath = path.posix.join(option?.baseUrl || '/', requestPath);

  addSwaggerTag(option?.tag);
  addSwaggerRoute(routePath, option);

  addRoute(
    routePath,
    async(ctx: Context) => {
      logger.debug(`request ${ctx.request.url}`, {
        headers: ctx.request.headers,
      });
      logger.info(`request ${ctx.request.url}`, {
        type: ctx.request.type,
        data: (ctx.request as any).body,
        query: ctx.request.query,
      });
      const res = await Promise.resolve(handler(...getParameters(ctx, option?.params)));
      if (res._extra) {
        const extra = res._extra;
        delete res._extra;
        extra.cookies?.forEach?.((item: any) => {
          ctx.cookies.set(item.key, item.value, item.option);
        });
        extra.headers?.forEach?.((item: any) => {
          ctx.response.set(item.key, item.value);
        });
      }

      if (res._briskControllerRedirect) {
        ctx.response.status = res._briskControllerRedirect.status;
        ctx.redirect(res._briskControllerRedirect.targetPath);
        return false;
      }

      if (res._briskControllerForward) {
        ctx.request.method = res._briskControllerForward.method.toUpperCase();
        ctx.request.path = res._briskControllerForward.targetPath;
        await router(ctx, () => Promise.resolve(null));
      } else {
        ctx.response.body = res;
      }
      logger.info(`response ${ctx.request.url}`, {
        status: ctx.response.status,
        body: ctx.response.body,
      });
      return true;
    },
    {
      method: option?.method,
      type: BRISK_CONTROLLER_ROUTER_TYPE_E.REQUEST,
    },
  );
}

/**
 * 开始运行
 * @param port 端口，默认3000
 * @param option 选项
 * @return Koa koa实例
 */
export async function start(port: number = 3000, option?: BriskControllerOption): Promise<Koa> {
  const globalBaseUrl = option?.globalBaseUrl ? path.posix.join('/', option.globalBaseUrl) : '/';
  setBaseUrl(globalBaseUrl);
  const app = new Koa();

  app.on('error', (error) => {
    logger.error('app error:', error);
  });

  if (option?.cors) {
    logger.debug('open cors');
    app.use(cors({
      credentials: true,
    }));
  }

  if (option?.staticPath) {
    app.use(staticMidware(path.resolve(option.staticPath)));
  }

  const realPort = await getPortPromise({
    port,
  });

  if (option?.swagger) {
    addRequest('/swagger.json', getSwaggerHandler(realPort, globalBaseUrl), {
      title: 'swagger文件(仅开启swagger后有效)',
      description: '获取swagger.json',
      tag: {
        name: 'System',
        description: '系统生成',
      },
    });

    // 打包字节码，koaSwagger运行会存在问题
    app.use(koaSwagger({
      routePrefix: '/swagger',
      hideTopbar: true,
      swaggerOptions: {
        url: './swagger.json',
      },
    }));
  }

  app.use(router);

  await new Promise((resolve) => {
    server = app.listen(realPort, '0.0.0.0', () => {
      logger.info(`listen http://0.0.0.0:${realPort}`);
      logger.info(`listen http://127.0.0.1:${realPort}`);
      logger.info(`listen http://localhost:${realPort}`);
      resolve(null);
    });
  });

  return app;
}

export function distory(): Promise<void> {
  initRouter();
  initSwaggerConfig();
  return new Promise((resolve, reject) => {
    server?.close((error) => {
      if (error) {
        logger.error('close error', error);
        reject(error);
        return;
      }
      logger.info('closed');
      resolve();
    });
  });
}


/* eslint-disable max-lines-per-function */
import { Context, Next, Middleware } from 'koa';
import {
  BriskControllerHeaders,
  BriskControllerRouterHandler,
  BriskControllerRouterOption,
  BRISK_CONTROLLER_METHOD_E,
  BRISK_CONTROLLER_MIME_TYPE_E,
  BRISK_CONTROLLER_ROUTER_TYPE_E,
} from '../types';
import { match } from 'path-to-regexp';
import parse from 'co-body';
import { getLogger, LOGGER_LEVEL_E } from 'brisk-log';


export class BriskControllerError extends Error {

  status!: number;

  text?: string;

  headers?: BriskControllerHeaders;

  constructor(_status: number, headers: BriskControllerHeaders, _text?: string)

  constructor(_status?: number, _text?: string)

  constructor(_status: number = 500, headers?: BriskControllerHeaders | string, _text?: string) {
    super();
    if (typeof headers === 'object') {
      this.headers = headers;
    }
    this.text = typeof headers === 'string' ? headers : _text;
    this.status = _status;
  }

}

// 路径、方法名、类型、处理器列表（按顺序执行）
let routers: Map<string, Map<BRISK_CONTROLLER_METHOD_E, Map<BRISK_CONTROLLER_ROUTER_TYPE_E, BriskControllerRouterHandler[]>>> = new Map();

const defaultRegion = Symbol('briskController');
const logger = getLogger(defaultRegion);
logger.configure({
  // 默认是info级别，可通过配置全局来改变此等级
  level: LOGGER_LEVEL_E.info,
});

export function addRoute(path: string, handler: BriskControllerRouterHandler, option?: BriskControllerRouterOption) {
  let methodMap = routers.get(path);
  if (!methodMap) {
    methodMap = new Map();
    routers.set(path, methodMap);
  }

  let typeMap = methodMap.get(option?.method || BRISK_CONTROLLER_METHOD_E.GET);
  if (!typeMap) {
    typeMap = new Map();
    methodMap.set(option?.method || BRISK_CONTROLLER_METHOD_E.GET, typeMap);
  }

  let handlers = typeMap.get(option?.type || BRISK_CONTROLLER_ROUTER_TYPE_E.REQUEST);
  if (!handlers) {
    handlers = [];
    typeMap.set(option?.type || BRISK_CONTROLLER_ROUTER_TYPE_E.REQUEST, handlers);
  }

  handlers.push(handler);
}

const jsonTypes = [
  BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_JSON,
  BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_JSON_PATCH_JSON,
  BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_VND_API_JSON,
];
const formTypes = [BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_X_WWW_FORM_URLENCODED];
const textTypes = [BRISK_CONTROLLER_MIME_TYPE_E.TEXT_PLAIN];

export function isJson(ctx: Context) {
  return ctx.request.is(jsonTypes);
}

export function isFormData(ctx: Context) {
  return ctx.request.is(formTypes);
}

export function isText(ctx: Context) {
  return ctx.request.is(textTypes);
}

function parseBody(ctx: Context) {
  if (isJson(ctx)) {
    return parse.json(ctx, {
      returnRawBody: true,
      limit: '1mb',
      encoding: 'utf-8',
    });
  }

  if (isFormData(ctx)) {
    return parse.form(ctx, {
      returnRawBody: true,
      limit: '56kb',
      encoding: 'utf-8',
    });
  }

  if (isText(ctx)) {
    return parse.text(ctx, {
      returnRawBody: true,
      encoding: 'utf-8',
    }).then((res) => res || '');
  }

  return Promise.resolve({});
}

export const router: Middleware = async(ctx: Context, next: Next) => {
  try {
    // 路径匹配
    const pathes = [...routers.keys()];
    for (const path of pathes) {
      const matchRes = match(path)(ctx.request.path);
      if (!matchRes || matchRes.index !== 0) {
        continue;
      }
      // 方法匹配
      const typeMap = routers.get(path)?.get(ctx.request.method.toLowerCase() as BRISK_CONTROLLER_METHOD_E);
      if (!typeMap) {
        ctx.response.status = 405;
        return;
      }
      // 路径参数放入pathParams
      (ctx.request as any).pathParams = matchRes.params;
      // 执行拦截器
      const interceptors = typeMap.get(BRISK_CONTROLLER_ROUTER_TYPE_E.INTERCEPTOR)
        || [];

      for (const interceptor of interceptors) {
        const interceptorRes = await interceptor(ctx);
        // 返回false，则终止后续所有处理
        if (!interceptorRes) {
          return;
        }
      }

      // 处理body
      try {
        const parseRes = await parseBody(ctx);
        ctx.request.body = 'parsed' in parseRes ? parseRes.parsed : {};
        if (ctx.request.rawBody === undefined) {
          ctx.request.rawBody = parseRes.raw;
        }
      } catch (parseError) {
        logger.error('parseBody failed!');
        ctx.response.status = 400;
        ctx.response.body = 'request body is format error';
        return;
      }

      // 执行请求处理器
      const requests = typeMap.get(BRISK_CONTROLLER_ROUTER_TYPE_E.REQUEST)
        || [];

      for (const request of requests) {
        const requestRes = await request(ctx);
        // 返回false，则终止后续所有处理
        if (!requestRes) {
          return;
        }
      }

      // 仅有匹配成功，且所有处理器都返回true，才继续下一个中间件，
      // 略后续中间件的返回值
      await next();
      return;
    }
    // 所有路径都不匹配，响应404
    ctx.response.status = 404;
  } catch (error) {
    if (error instanceof BriskControllerError) {
      ctx.response.status = error.status;
      if (error.headers) {
        Object.entries(error.headers).forEach(([key, value]) => {
          ctx.response.set(key, value);
        });
      }
      if (error.text) {
        ctx.response.body = error.text;
      }
      return;
    }

    // 普通异常
    logger.error(`[${ctx.request.method}] ${ctx.request.url} Error:`, error);
    ctx.response.status = 500;
  }
};

export function initRouter() {
  routers = new Map();
}

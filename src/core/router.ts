/* eslint-disable max-lines-per-function */
import { Context, Next, Middleware } from 'koa';
import {
  BriskControllerHeaders,
  BriskControllerPathInfo,
  BriskControllerRouterHandler,
  BriskControllerRouterOption,
  BRISK_CONTROLLER_METHOD_E,
  BRISK_CONTROLLER_MIME_TYPE_E,
  BRISK_CONTROLLER_ROUTER_TYPE_E,
} from '../types';
import { match } from 'path-to-regexp';
import parse from 'co-body';
import { getLogger, LOGGER_LEVEL_E } from 'brisk-log';
import nodePath from 'path';
import { parseStringPromise } from 'xml2js';
import { isLike } from 'brisk-ts-extends';
import { IncomingForm } from 'formidable';


// 保存运行时参数
const globalVal: {
  _briskControllerBaseUrl?: string,
  // 路径、方法名、类型、处理器列表（按顺序执行）
  _briskControllerRouters?: Map<string, Map<BRISK_CONTROLLER_METHOD_E, Map<BRISK_CONTROLLER_ROUTER_TYPE_E, BriskControllerRouterHandler[]>>>,
  [key: string | symbol | number]: any,
} = globalThis;

if (!globalVal._briskControllerBaseUrl) {
  globalVal._briskControllerBaseUrl = '/';
}

if (!globalVal._briskControllerRouters) {
  globalVal._briskControllerRouters = new Map();
}


export function setBaseUrl(_baseUrl: string) {
  globalVal._briskControllerBaseUrl = _baseUrl;
}

export class BriskControllerError extends Error {

  status!: number;

  text?: string | any;

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

  setBody(body: any) {
    this.text = body;
  }

}


const defaultRegion = Symbol('briskControllerRouter');
const logger = getLogger(defaultRegion);
logger.configure({
  // 默认是info级别，可通过配置全局来改变此等级
  level: LOGGER_LEVEL_E.info,
});

export function addRoute(path: string, handler: BriskControllerRouterHandler, option?: BriskControllerRouterOption) {
  const realPath = path.length > 1 && path.charAt(path.length - 1) === '/' ? path.substring(0, path.length - 1) : path;
  let methodMap = globalVal._briskControllerRouters!.get(realPath);
  if (!methodMap) {
    methodMap = new Map();
    globalVal._briskControllerRouters!.set(realPath, methodMap);
  }

  const methods = Array.isArray(option?.method) ? option!.method : [option?.method || BRISK_CONTROLLER_METHOD_E.GET];

  methods.forEach((method) => {
    let typeMap = methodMap!.get(method);
    if (!typeMap) {
      typeMap = new Map();
      methodMap!.set(method, typeMap);
    }

    let handlers = typeMap.get(option?.type || BRISK_CONTROLLER_ROUTER_TYPE_E.REQUEST);
    if (!handlers) {
      handlers = [];
      typeMap.set(option?.type || BRISK_CONTROLLER_ROUTER_TYPE_E.REQUEST, handlers);
    }

    handlers.push(handler);
  });
}

const jsonTypes = [
  BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_JSON,
  BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_JSON_PATCH_JSON,
  BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_VND_API_JSON,
];
const formTypes = [BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_X_WWW_FORM_URLENCODED];
const textTypes = [BRISK_CONTROLLER_MIME_TYPE_E.TEXT_PLAIN];
const xmlTypes = [BRISK_CONTROLLER_MIME_TYPE_E.TEXT_XML];
const fileTypes = [BRISK_CONTROLLER_MIME_TYPE_E.MULTIPART_FORM_DATA];

export function isJson(ctx: Context) {
  return ctx.request.is(jsonTypes);
}

export function isFormData(ctx: Context) {
  return ctx.request.is(formTypes);
}

export function isText(ctx: Context) {
  return ctx.request.is(textTypes);
}

export function isXml(ctx: Context) {
  return ctx.request.is(xmlTypes);
}

export function isFile(ctx: Context) {
  return ctx.request.is(fileTypes);
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

  if (isXml(ctx)) {
    return parse.text(ctx, {
      returnRawBody: true,
      encoding: 'utf-8',
    }).then((res) => {
      logger.debug('xml: ', res);
      return parseStringPromise(res.parsed || '').then((xml) => ({
        parsed: xml,
        raw: res.raw,
      }));
    });
  }

  if (isFile(ctx)) {
    const incomingForm = new IncomingForm();
    return incomingForm.parse(ctx.req).then(([fields, files]) => ({
      parsed: fields,
      files,
    }));
  }

  return Promise.resolve({});
}


export const router: Middleware = async(ctx: Context, next: Next) => {
  try {
    // 路径匹配
    const pathInfos = [...globalVal._briskControllerRouters!.keys()]
      // 筛选出匹配的
      .reduce((res, path) => {
        const matchRes = match(nodePath.posix.join(globalVal._briskControllerBaseUrl!, path))(ctx.request.path);
        if (matchRes && matchRes.index === 0) {
          res.push({
            path,
            params: matchRes.params,
            methodMap: globalVal._briskControllerRouters!.get(path),
          });
        }
        return res;
      }, [] as BriskControllerPathInfo[])
      // 排序，层级越少的越放前面
      .sort((pathInfoA, pathInfoB) => (pathInfoA.path.match(/\//ug)?.length || 0) - (pathInfoB.path.match(/\//ug)?.length || 0));

    // 无匹配
    if (!pathInfos.length) {
      // 执行后续中间件
      await next();
      return;
    }

    // 所有路径下的方法列表不包含当前的方法，报405错误
    if (pathInfos.length && pathInfos.every((pathInfo) => !pathInfo.methodMap?.has(ctx.request.method.toLowerCase() as BRISK_CONTROLLER_METHOD_E))) {
      ctx.response.status = 405;
      return;
    }

    // 先执行所有拦截器
    for (const pathInfo of pathInfos) {
      // 路径参数放入pathParams
      (ctx.request as any).pathParams = pathInfo.params;
      const interceptors = pathInfo.methodMap
        ?.get(ctx.request.method.toLowerCase() as BRISK_CONTROLLER_METHOD_E)
        ?.get(BRISK_CONTROLLER_ROUTER_TYPE_E.INTERCEPTOR)
        || [];

      for (const interceptor of interceptors) {
        const interceptorRes = await interceptor(ctx);
        // 返回false，则终止后续所有处理
        if (!interceptorRes) {
          return;
        }
      }
    }

    // 处理body
    try {
      const parseRes = await parseBody(ctx);
      (ctx.request as any).body = 'parsed' in parseRes ? parseRes.parsed : {};
      (ctx.request as any).files = 'files' in parseRes ? parseRes.files : {};
      if ((ctx.request as any).rawBody === undefined) {
        (ctx.request as any).rawBody = parseRes.raw;
      }
    } catch (parseError) {
      logger.error('parseBody failed!');
      logger.debug('parseBody failed error: ', parseError);
      ctx.response.status = 400;
      ctx.response.body = 'request body is format error';
      return;
    }

    // 执行所有请求处理器
    for (const pathInfo of pathInfos) {
      // 路径参数放入pathParams
      (ctx.request as any).pathParams = pathInfo.params;
      const requests = pathInfo.methodMap
        ?.get(ctx.request.method.toLowerCase() as BRISK_CONTROLLER_METHOD_E)
        ?.get(BRISK_CONTROLLER_ROUTER_TYPE_E.REQUEST)
        || [];

      for (const request of requests) {
        const requestRes = await request(ctx);
        // 返回false，则终止后续所有处理
        if (!requestRes) {
          return;
        }
      }
    }

    // 执行后续中间件
    await next();
    return;
  } catch (error) {
    if (isLike<BriskControllerError>(error)) {
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

export function reInitRouter() {
  globalVal._briskControllerRouters! = new Map();
}

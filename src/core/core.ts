import { koaSwagger } from 'koa2-swagger-ui';
import { getLogger, LOGGER_LEVEL_E } from 'brisk-log';
import Koa, { Context, Next } from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import Router from 'koa-router';
import staticMidware from 'koa-static';
import path from 'path';
import http, { Server } from 'http';
import {
  BriskControllerRequestHandler,
  BriskControllerOption,
  BriskControllerRequestOption,
  BriskControllerInterceptorOption,
  BRISK_CONTROLLER_METHOD_E,
  BriskControllerParameter,
  BRISK_CONTROLLER_PARAMETER_IS_E,
  BRISK_CONTROLLER_MIME_TYPE_E,
  BriskControllerInterceptorHandler,
  BriskControllerRouter,
  BRISK_CONTROLLER_ROUTER_TYPE_E,
} from '../types';
import { isLike } from 'brisk-ts-extends';
import { get } from 'brisk-ts-extends/runtime';
import { addSwaggerRoute, addSwaggerTag, getSwaggerHandler, initSwaggerConfig } from './swagger';
import { getRouteMethod, isValid, parseBoolean } from './utils';


const defaultRegion = Symbol('briskController');
const logger = getLogger(defaultRegion);
logger.configure({
  // 默认是info级别，可通过配置全局来改变此等级
  level: LOGGER_LEVEL_E.info,
});

let server: Server;

let globalBaseUrl = '/';

let routers: Map<string, Map<BRISK_CONTROLLER_METHOD_E, BriskControllerRouter[]>> = new Map();

/**
 * 抛出错误响应
 * @param status 状态码
 * @param msg 错误内容
 */
export function throwError(status: number, msg?: any): void {
  const error: any = new Error();
  error.status = status;
  error.msg = msg;
  throw error;
}

/**
 * 路由跳转
 * @param targetPath 目标路由
 * @param status 状态码，默认301
 * @returns
 */
export function redirect(targetPath: string, status: number = 301) {
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
export function forward(targetPath: string, method = BRISK_CONTROLLER_METHOD_E.GET) {
  return {
    _briskControllerForward: {
      targetPath,
      method,
    },
  };
}


function typeValidateParameter(param: BriskControllerParameter, value: any) {
  if (!isValid(value)) {
    if (param.required) {
      throwError(400, `param '${param.name}' required`);
    } else {
      return undefined;
    }
  }

  if (!param.type) {
    return value;
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
  return typedes.properties.reduce((pre, current) => {
    pre[current.key] = value[current.key];
    return pre;
  }, {} as any);
}

function validateParameter(param: BriskControllerParameter, value: any) {
  const val = typeValidateParameter(param, value);
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

  const data: any = ctx.request.body || {};

  return params.map((item) => {
    let value: any;
    switch (item.is) {
      case BRISK_CONTROLLER_PARAMETER_IS_E.IN_BODY:
        value = ctx.request.type === BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_JSON
          ? data[item.name]
          : undefined;
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.FORM_DATA:
        value = ctx.request.type === BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_X_WWW_FORM_URLENCODED
          ? data[item.name]
          : undefined;
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.BODY:
        value = ctx.request.type === BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_JSON
          ? data
          : undefined;
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.QUERY:
        value = ctx.request.query[item.name];
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.PATH:
        value = ctx.params?.[item.name];
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.HEADER:
        value = ctx.request.headers[item.name];
        break;
      case BRISK_CONTROLLER_PARAMETER_IS_E.COOKIE:
        value = ctx.cookies.get(item.name);
        break;
      default:
        return undefined;
    }
    const val = validateParameter(item, value);
    return isValid(val) ? val : item.default;
  });
}

function catchRequestError(ctx: Context, error: any) {
  ctx.response.status = error.status || 500;
  if (error.msg) {
    ctx.response.body = error.msg;
  }
}

/**
 * 添加拦截器
 * @param requestPath 路径
 * @param fn 路由处理器
 * @param option 拦截器选项
 */
export function addInterceptor(requestPath: string, handler: BriskControllerInterceptorHandler, option?: BriskControllerInterceptorOption) {
  const routePath = path.posix.join(option?.baseUrl || '/', requestPath);

  let methodMap = routers.get(routePath);
  if (!methodMap) {
    methodMap = new Map();
    routers.set(routePath, methodMap);
  }

  let routeHandlers = methodMap.get(option?.method || BRISK_CONTROLLER_METHOD_E.GET);
  if (!routeHandlers) {
    routeHandlers = [];
    methodMap.set(option?.method || BRISK_CONTROLLER_METHOD_E.GET, routeHandlers);
  }

  routeHandlers.push({
    type: BRISK_CONTROLLER_ROUTER_TYPE_E.INTERCEPTOR,
    handler: async(ctx: Context, next: Next) => {
      logger.debug(`interceptor ${ctx.request.url}`, {
        type: ctx.request.type,
        data: ctx.request.body,
        query: ctx.request.query,
        headers: ctx.request.headers,
      });
      try {
        const res = await Promise.resolve(handler(ctx.request, ctx.response));
        // 当拦截器返回true时，才继续执行
        if (res) {
          await next();
        }
      } catch (error: any) {
        catchRequestError(ctx, error);
        logger.error(`interceptor ${ctx.request.url} error`, error);
      }
    },
  });
}

function forwardTo(ctx: Context, targetPath: string) {
  const option: http.RequestOptions = {
    hostname: 'localhost',
    port: ctx.request.URL.port,
    path: targetPath,
    method: ctx.request.method,
    headers: ctx.request.headers,
  };
  return new Promise((resolve, reject) => {
    const proxyReq = http.request(option, (proxyRes) => {
      let buffers: Buffer[] = [];
      proxyRes.on('data', (data) => {
        buffers.push(data);
      });
      proxyRes.on('end', () => {
        ctx.response.status = proxyRes.statusCode || 200;
        ctx.response.set(proxyRes.headers as any);
        resolve(Buffer.concat(buffers));
      });
    });
    proxyReq.on('error', (err) => {
      reject(err);
    });
    proxyReq.end();
  });
}

/**
 * 添加Request
 * @param requestPath 路径
 * @param handler 请求处理器
 * @param option 路由选项
 */
export function addRequest(requestPath: string, handler: BriskControllerRequestHandler, option?: BriskControllerRequestOption) {
  const routePath = path.posix.join(option?.baseUrl || '/', requestPath);

  let methodMap = routers.get(routePath);
  if (!methodMap) {
    methodMap = new Map();
    routers.set(routePath, methodMap);
  }

  let routeHandlers = methodMap.get(option?.method || BRISK_CONTROLLER_METHOD_E.GET);
  if (!routeHandlers) {
    routeHandlers = [];
    methodMap.set(option?.method || BRISK_CONTROLLER_METHOD_E.GET, routeHandlers);
  }
  addSwaggerTag({
    name: option?.tag || 'default',
  });

  addSwaggerRoute(routePath, option);

  routeHandlers.push({
    type: BRISK_CONTROLLER_ROUTER_TYPE_E.REQUEST,
    handler: async(ctx: Context, next: Next) => {
      logger.debug(`request ${ctx.request.url}`, {
        headers: ctx.request.headers,
      });
      logger.info(`request ${ctx.request.url}`, {
        type: ctx.request.type,
        data: ctx.request.body,
        query: ctx.request.query,
      });
      try {
        const res = await Promise.resolve(handler(...getParameters(ctx, option?.params)));
        if (res._briskControllerRedirect) {
          ctx.redirect(res._briskControllerRedirect.targetPath);
          ctx.status = res._briskControllerRedirect.status;
          return;
        }

        if (res._briskControllerForward) {
          ctx.request.method = res._briskControllerForward.method.toUpperCase();
          ctx.response.body = await forwardTo(ctx, res._briskControllerForward.targetPath);
        } else {
          ctx.response.body = res;
        }
        logger.info(`response ${ctx.request.url}`, {
          status: ctx.response.status,
          body: ctx.response.body,
        });
        await next();
      } catch (error: any) {
        catchRequestError(ctx, error);
        logger.error(`request ${ctx.request.url} error`, error);
      }
    },
  });
}

/**
 * 开始运行
 * @param port 端口，默认3000
 * @param option 选项
 * @return Koa koa实例
 */
export function start(port: number = 3000, option?: BriskControllerOption): Promise<Koa> {
  globalBaseUrl = option?.globalBaseUrl ? path.posix.join('/', option.globalBaseUrl) : '/';
  const app = new Koa();
  const router = new Router();

  app.on('error', (error) => {
    logger.error(error);
  });

  if (option?.cors) {
    logger.debug('open cors');
    app.use(cors());
  }
  app.use(bodyParser());
  if (option?.staticPath) {
    app.use(staticMidware(path.resolve(option.staticPath)));
  }

  if (option?.swagger) {
    addRequest('/swagger.json', getSwaggerHandler(port, globalBaseUrl), {
      title: 'swagger文件(仅开启swagger后有效)',
      description: '获取swagger.json',
      tag: 'system',
    });
    app.use(koaSwagger({
      routePrefix: '/swagger',
      hideTopbar: true,
      swaggerOptions: {
        url: './swagger.json',
      },
    }));
  }
  routers.forEach((methodMap, routePath) => {
    methodMap.forEach((briskRouters, method) => {
      const routeMethod = getRouteMethod(method, router);
      const interceptors = briskRouters
        .filter((item) => item.type === BRISK_CONTROLLER_ROUTER_TYPE_E.INTERCEPTOR)
        .map((item) => item.handler);
      const requests = briskRouters
        .filter((item) => item.type === BRISK_CONTROLLER_ROUTER_TYPE_E.REQUEST)
        .map((item) => item.handler);
      routeMethod(path.posix.join(globalBaseUrl, routePath), ...interceptors, ...requests);
    });
  });
  app.use(router.routes());
  app.use(router.allowedMethods());
  return new Promise((resolve) => {
    server = app.listen(port, () => {
      logger.info(`listen http://localhost:${port}`);
      resolve(app);
    });
  });
}

export function distory(): Promise<void> {
  routers = new Map();
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


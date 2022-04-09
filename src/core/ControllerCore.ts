import {
  ControllerBean,
  ControllerRouter,
  InterceptorRouter,
  InterceptorBean,
} from '@interface';

import { BriskIoC } from 'brisk-ioc';
import { BriskLog, Logger } from 'brisk-log';
import express, {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import * as http from 'http';
import * as path from 'path';
import { ResultTypeEnum, MethodEnum, MetaKeyEnum } from '@enum';
import { RouterCbFactory } from '@core/RouterCbFactory';

/**
 * ControllerCore
 * @description 控制器核心类
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 10:25:36
 * @version 2.0.0
 */
export class ControllerCore {

  static #instance?: ControllerCore;

  public static controllerRegion: Symbol = Symbol('controller');

  public static interceptorRegion: Symbol = Symbol('interceptor');

  public static getInstance(): ControllerCore {
    if (!ControllerCore.#instance) {
      ControllerCore.#instance = new ControllerCore();
    }
    return ControllerCore.#instance;
  }

  public isInstall = false;

  public isDebug = false;

  public app?: Express;

  public port?: number;

  public priority?: number;

  public baseUrl?: string;

  public logger: Logger = BriskLog.getLogger(Symbol('brisk-controller'));

  public scanController(): void {
    if (!this.isInstall) {
      this.logger.error('no install brisk-controller');
    }
    this.isDebug && this.logger.debug('scanController...');

    // 添加前置拦截器
    const interceptorBeans = BriskIoC.core.getBeans<InterceptorBean>(ControllerCore.interceptorRegion);
    interceptorBeans.forEach((interceptorBean) => {
      const { target, option } = interceptorBean;
      const interceptorPath = path.posix.join(this.baseUrl ?? '/', option.path);

      const routers: InterceptorRouter[] = Reflect.getMetadata(MetaKeyEnum.ROUTER_META_KEY, target) || [];

      // 添加拦截器路由(遍历所有方法)
      routers.forEach((controllerRouter) => {
        this.app!.all(interceptorPath, this.interceptorFactory(interceptorBean, controllerRouter));
        this.isDebug && this.logger.debug(`   interceptor router:${interceptorPath}`);
      });
    });


    // 注册控制器
    const controllerBeans = BriskIoC.core.getBeans<ControllerBean>(ControllerCore.controllerRegion);
    controllerBeans.forEach((controllerBean) => {
      const { target, option } = controllerBean;
      // 创建控制器
      const controllerPath = path.posix.join(this.baseUrl ?? '/', option.path);
      this.isDebug && this.logger.debug(`controller :${controllerPath}`);

      let expressRouter = express.Router();
      const routers: ControllerRouter[] = Reflect.getMetadata(MetaKeyEnum.ROUTER_META_KEY, target) || [];
      // 添加路由(遍历所有方法)
      routers.forEach((controllerRouter) => {
        const { option: { method, path: routerPath } } = controllerRouter;
        switch (method) {
          case MethodEnum.GET:
            expressRouter.get(routerPath, this.controllerFactory(controllerBean, controllerRouter));
            this.isDebug && this.logger.debug(`   router get:${routerPath}`);
            break;
          case MethodEnum.POST:
            expressRouter.post(routerPath, this.controllerFactory(controllerBean, controllerRouter));
            this.isDebug && this.logger.debug(`   router post:${routerPath}`);
            break;
          case MethodEnum.PUT:
            expressRouter.put(routerPath, this.controllerFactory(controllerBean, controllerRouter));
            this.isDebug && this.logger.debug(`   router put:${routerPath}`);
            break;
          case MethodEnum.DELETE:
            expressRouter.delete(routerPath, this.controllerFactory(controllerBean, controllerRouter));
            this.isDebug && this.logger.debug(`   router delete:${routerPath}`);
            break;
            // no default
        }
      });

      this.app!.use(controllerPath, expressRouter);
    });
    this.logger.info(`controllers:[${controllerBeans.length}], interceptors:[${interceptorBeans.length}]`);
  }


  private interceptorFactory(interceptorBean: InterceptorBean, interceptorRouter: InterceptorRouter): RequestHandler {
    return async(req: Request, res: Response, next: NextFunction) => {
      this.isDebug && this.logger.debug(`interceptor:${req.path}`);
      const routerCb = RouterCbFactory.getInterceptorCb(req, res, next, interceptorBean, interceptorRouter);
      await routerCb();
    };
  }

  private controllerFactory(controllerBean: ControllerBean, controllerRouter: ControllerRouter): RequestHandler {
    return async(req: Request, res: Response, next: NextFunction) => {
      const routerCb = RouterCbFactory.getControllerCb(req, res, next, controllerBean, controllerRouter);
      const result = await routerCb();

      this.isDebug && this.logger.debug(`${req.method} ${req.path} \n${JSON.stringify(result, null, 2)}`);

      if (result && result.type && result.statusCode && result.content) {
        switch (result.type) {
          case ResultTypeEnum.JSON:
            res.status(result.statusCode);
            res.json(result.content);
            break;
          case ResultTypeEnum.REDIRECT:
            res.redirect(result.statusCode, result.content);
            break;
          case ResultTypeEnum.RENDER:
            res.status(result.statusCode);
            res.render(result.content);
            break;
          case ResultTypeEnum.FORWARD:
            this.forward(result.content.toString(), req, res, next);
            break;
          // no default
        }
      }
    };
  }


  /**
   * 转发请求，待完善
   * @param url 地址
   * @param req 请求
   * @param res 返回
   * @param next 下一步
   */
  private forward(url: string, req: Request, res: Response, next: NextFunction):void {
    const option: http.RequestOptions = {
      hostname: 'localhost',
      port: this.port || 3000,
      path: url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(option, (proxyRes) => {
      let buffers: Buffer[] = [];
      proxyRes.on('data', (data) => {
        buffers.push(data);
      });

      proxyRes.on('end', () => {
        res.status(proxyRes.statusCode || 200);
        res.set(proxyRes.headers);
        res.send(Buffer.concat(buffers));
        res.end();
      });
    });

    proxyReq.on('error', (err) => {
      next(err);
    });

    proxyReq.end();
  }

}

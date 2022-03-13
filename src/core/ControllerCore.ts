import { QueryStr } from './../interface/IControllerParams';
import * as path from 'path';
import {
  ControllerResultTypeEnum,
} from './../interface/IControllerResult';
import { RouterFilterBean } from './../entity/bean/RouterFilterBean';
import { ControllerBean } from '../entity/bean/ControllerBean';
import { Core, Logger } from 'brisk-ioc';
import express, {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { Method } from '../interface/option/IRequestMappingOption';
import { IControllerParams } from '../interface/IControllerParams';


/**
 * ControllerCore
 * @description 控制器核心类
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 10:25:36
 * @version 2.0.0
 */
export class ControllerCore {

  private static instance?: ControllerCore;

  public static getInstance(): ControllerCore {
    if (!ControllerCore.instance) {
      ControllerCore.instance = new ControllerCore();
    }
    return ControllerCore.instance;
  }

  public core?: Core;

  public app?: Express;

  public port?: number;

  public priority?: number;

  public baseUrl?: string;

  public logger: Logger = Logger.getInstance('brisk-controller');

  public scanController(): void {
    if (!this.core || !this.app) {
      this.logger.error('no install brisk-controller');
      return;
    }
    Logger.isDebug && this.logger.debug('scanController...');
    // 添加前置拦截器
    const routerFilters = [...this.core.container.entries()].filter(([key]) => key.toString().indexOf('routerfilter-') > -1);
    routerFilters.forEach(([, bean]) => {
      let { routerFilter, path: routerPath } = bean as RouterFilterBean;
      routerPath = path.posix.join(this.baseUrl ?? '/', routerPath);
      if (typeof routerFilter['before'] === 'function') {
        let fn = routerFilter['before'] as Function;
          this.app!.all(routerPath, this.routerFactory(routerFilter, fn));
      }
    });

    // 扫描并注册控制器
    const controllers = [...this.core.container.entries()].filter(([key]) => key.toString().indexOf('controller-') > -1);
    controllers.forEach(([, bean]) => {
      // 创建控制器
      let { controller, path: controllerPath } = bean as ControllerBean;
      controllerPath = path.posix.join(this.baseUrl ?? '/', controllerPath);
      Logger.isDebug && this.logger.debug(`controller :${controllerPath}`);
      // 添加路由(遍历所有方法)
      let router = express.Router();
      controller.$routers?.forEach((rt: any) => {
        switch (rt.method) {
          case Method.GET:
            router.get(rt.path, this.routerFactory(controller, rt.fn));
            Logger.isDebug && this.logger.debug(`   router get:${rt.path}`);
            break;
          case Method.POST:
            router.post(rt.path, this.routerFactory(controller, rt.fn));
            Logger.isDebug && this.logger.debug(`   router post:${rt.path}`);
            break;
          case Method.PUT:
            router.put(rt.path, this.routerFactory(controller, rt.fn));
            Logger.isDebug && this.logger.debug(`   router put:${rt.path}`);
            break;
          case Method.DELETE:
            router.delete(rt.path, this.routerFactory(controller, rt.fn));
            Logger.isDebug && this.logger.debug(`   router delete:${rt.path}`);
            break;
          case Method.All:
            router.all(rt.path, this.routerFactory(controller, rt.fn));
            Logger.isDebug && this.logger.debug(`   router all:${rt.path}`);
            break;
            // no default
        }
      });
        this.app!.use(controllerPath, router);
    });

    this.logger.info(`routerFilters:[${routerFilters.length}] controllers:[${controllers.length}]`);
  }

  public routerFactory(controller: any, fn: Function): RequestHandler {
    const _that = this;
    return async function(req: Request, res: Response, next: NextFunction) {
      let controllerParams: IControllerParams = {
        req,
        res,
        next,
        // 动态路由参数path中
        params: req.params,
        // post body参数
        body: req.body,
        query: req.query as QueryStr,
        cookies: req.cookies,
        originalUrl: req.originalUrl,
        headers: req.headers,
      } as IControllerParams;
      let result = fn.apply(controller, [controllerParams]);

      if (result && result instanceof Promise) {
        result = await result;
      }

      Logger.isDebug && _that.logger.debug(`${req.method} ${req.path} \n${JSON.stringify(result, null, 2)}`);

      if (result && result.type && result.statusCode && result.content) {
        switch (result.type) {
          case ControllerResultTypeEnum.JSON:
            res.status(result.statusCode);
            res.json(result.content);
            break;
          case ControllerResultTypeEnum.REDIRECT:
            res.redirect(result.content);
            break;
          case ControllerResultTypeEnum.RENDER:
            res.status(result.statusCode);
            res.render(result.content);
          // no default
        }
      }
    };
  }

}

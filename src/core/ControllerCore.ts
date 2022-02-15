import * as path from 'path';
import {
  ControllerResultTypeEnum,
  IControllerResult,
} from "./../interface/IControllerResult";
import { RouterFilterBean } from "./../entity/bean/RouterFilterBean";
import { ControllerBean } from "../entity/bean/ControllerBean";
import { Core } from "brisk-ioc";
import express, {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { Method } from "../interface/option/IRequestMappingOption";
import { IControllerParams } from "../interface/IControllerParams";
import { ControllerResult } from "../entity/ControllerResult";
import { URLJoin } from '../utils/URLJoin';


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
    if (!ControllerCore.instance)
      ControllerCore.instance = new ControllerCore();
    return ControllerCore.instance;
  }

  public core?: Core;

  public app?: Express;

  public port?: number;

  public priority?: number;

  public baseUrl?: string;

  public scanController(): void {
    if (!this.core || !this.app) {
      return;
    }

    console.log("scanController...");

    //添加前置拦截器
    [...this.core.container.entries()]
      .filter(([key]) => key.toString().indexOf("routerfilter-") > -1)
      .forEach(([key, bean]) => {
        let { routerFilter, path } = bean as RouterFilterBean;
        path = URLJoin(this.baseUrl ?? "/", path);
        if (typeof routerFilter["before"] === "function") {
          let fn = routerFilter["before"] as Function;
          this.app!.all(path, this.routerFactory(routerFilter, fn));
        }
      });

    //扫描并注册控制器
    [...this.core.container.entries()]
      .filter(([key]) => key.toString().indexOf("controller-") > -1)
      .forEach(([key, bean]) => {
        //创建控制器
        let { controller, path } = bean as ControllerBean;
        path = URLJoin(this.baseUrl ?? "/", path);
        console.log("controller :" + path);
        //添加路由(遍历所有方法)
        let router = express.Router();
        controller.$routers?.forEach((rt: any) => {
          switch (rt.method) {
            case Method.GET:
              router.get(rt.path, this.routerFactory(controller, rt.fn));
              console.log("   router get:" + rt.path);
              break;
            case Method.POST:
              router.post(rt.path, this.routerFactory(controller, rt.fn));
              console.log("   router post:" + rt.path);
              break;
            case Method.PUT:
              router.put(rt.path, this.routerFactory(controller, rt.fn));
              console.log("   router put:" + rt.path);
              break;
            case Method.DELETE:
              router.delete(rt.path, this.routerFactory(controller, rt.fn));
              console.log("   router delete:" + rt.path);
              break;
            case Method.All:
              router.all(rt.path, this.routerFactory(controller, rt.fn));
              console.log("   router all:" + rt.path);
              break;
            //no default
          }
        });

        this.app!.use(path, router);
      });
  }

  public routerFactory(controller: any, fn: Function): RequestHandler {
    return async function (req: Request, res: Response, next: NextFunction) {
      let controllerParams: IControllerParams = {
        req,
        res,
        next,
        params: req.params, //动态路由参数path中
        body: req.body, //post body参数
        query: req.query,
        cookies: req.cookies,
        originalUrl: req.originalUrl,
        headers: req.headers,
      } as IControllerParams;
      let result = fn.apply(controller, [controllerParams]);

      if (result && result.constructor.name == "Promise") {
        result = await result;
      }

      console.log(result);

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
        }
      }
    };
  }

}

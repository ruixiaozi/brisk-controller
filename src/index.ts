import { ControllerPluginOption } from "./entity/option/ControllerPluginOption";
import { InitFunc, IPlugin, Core } from "brisk-ioc";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import logger from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { ControllerCore } from "./core/ControllerCore";
import createError from "http-errors";
import { IControllerPluginOption } from "./interface/option/IControllerPluginOption";

// 核心
export * from "./core/ControllerCore";

// 装饰器
export * from "./decorator/ControllerDecorator";

// 实体
export * from "./entity/option/ControllerOption";
export * from "./entity/option/RequestMappingOption";
export * from "./entity/option/RouterFilterOption";
export * from "./entity/option/ControllerPluginOption";

// 接口
export * from "./interface/option/IControllerOption";
export * from "./interface/option/IControllerPluginOption";
export * from "./interface/option/IRequestMappingOption";
export * from "./interface/option/IRouterFilterOption";

/**
 * _ControllerPlugin
 * @description 控制器插件
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 22:33:05
 * @version 2.0.0
 */
class _ControllerPlugin implements IPlugin {
  private controllerCore: ControllerCore = ControllerCore.getInstance();

  install(core: Core, option?: IControllerPluginOption): void {
    if (!option) option = new ControllerPluginOption();
    this.controllerCore.app = express();
    this.controllerCore.core = core;
    this.controllerCore.port = option.port;
    this.controllerCore.priority = option.priority;

    if (option.cors) {
      console.log("use cors...");
      this.controllerCore.app.use(
        cors({
          origin: [/.*/], //指定接收的地址
          methods: ["GET", "PUT", "POST"], //指定接收的请求类型
          allowedHeaders: ["Content-Type", "Authorization"], //指定header
          credentials: true,
        })
      );
    }

    this.controllerCore.app.use(logger("dev"));
    this.controllerCore.app.use(
      express.json(option.limit ? { limit: option.limit } : {})
    );
    this.controllerCore.app.use(express.urlencoded({ extended: false }));
    this.controllerCore.app.use(cookieParser());
    this.controllerCore.app.use(express.static(path.join(__dirname, "public")));

    core.initList.push(
      new InitFunc(
        this.controllerCore.scanController.bind(this.controllerCore),
        this.controllerCore.priority!
      )
    );
  }

  start() {
    if (!this.controllerCore.app) {
      console.log("do not install");
      return;
    }

    this.controllerCore.app.use(
      (req: Request, res: Response, next: NextFunction) => {
        next(createError(404));
      }
    );

    this.controllerCore.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.json(err);
      }
    );
    this.controllerCore.app.listen(this.controllerCore.port);
    console.log("listen to " + this.controllerCore.port);
    console.log("http://localhost:" + this.controllerCore.port);
  }
}

export const BriskController = new _ControllerPlugin();

import { ControllerPluginOption } from './entity/option/ControllerPluginOption';
import { InitFunc, IPlugin, Core, Logger } from 'brisk-ioc';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ControllerCore } from './core/ControllerCore';
import createError from 'http-errors';
import { IControllerPluginOption } from './interface/option/IControllerPluginOption';

// 核心
export * from './core/ControllerCore';

// 装饰器
export * from './decorator/ControllerDecorator';

// 实体
export * from './entity/option/ControllerOption';
export * from './entity/option/RequestMappingOption';
export * from './entity/option/RouterFilterOption';
export * from './entity/option/ControllerPluginOption';
export * from './entity/ControllerResult';

// 接口
export * from './interface/option/IControllerOption';
export * from './interface/option/IControllerPluginOption';
export * from './interface/option/IRequestMappingOption';
export * from './interface/option/IRouterFilterOption';
export * from './interface/IControllerParams';
export * from './interface/IControllerResult';


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

  name = 'BriskController';

  install(core: Core, option?: IControllerPluginOption): void {
    const pluginOption = option || new ControllerPluginOption();
    this.controllerCore.app = express();
    this.controllerCore.core = core;
    this.controllerCore.port = pluginOption.port;
    this.controllerCore.priority = pluginOption.priority;
    this.controllerCore.baseUrl = pluginOption.baseUrl;

    if (pluginOption.cors) {
      Logger.isDebug && this.controllerCore.logger.debug('use cors...');
      this.controllerCore.app.use(cors({
        // 指定接收的地址
        origin: [/.*/u],
        // 指定接收的请求类型
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
        // 指定header
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      }));
    }

    this.controllerCore.app.use(express.json(pluginOption.limit ? { limit: pluginOption.limit } : {}));
    this.controllerCore.app.use(express.urlencoded({ extended: false }));
    this.controllerCore.app.use(cookieParser());
    if (pluginOption.staticPath) {
      this.controllerCore.app.use(express.static(pluginOption.staticPath));
    }
    core.initList.push(new InitFunc(
      this.controllerCore.scanController.bind(this.controllerCore),
        this.controllerCore.priority!,
    ));
  }

  start() {
    if (!this.controllerCore.app) {
      this.controllerCore.logger.error('do not install');
      return;
    }

    // 没有匹配的路由，则走到这里
    this.controllerCore.app.use((req: Request, res: Response, next: NextFunction) => {
      next(createError(404));
    });

    // 所有报错
    this.controllerCore.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      const errorJson = JSON.stringify(err, null, 2);
      this.controllerCore.logger.error(`${req.method} ${req.path} ${err.status || 500} \n${errorJson}`);

      next;
      // render the error page
      res.status(err.status || 500);
      res.json(err);
    });
    this.controllerCore.app.listen(this.controllerCore.port);
    this.controllerCore.logger.info(`listen to ${this.controllerCore.port}`);
    this.controllerCore.logger.info(`http://localhost:${this.controllerCore.port}`);
  }

}

export const BriskController = new _ControllerPlugin();

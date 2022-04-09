import { is, configPath as IS_CONFIG_PATH } from 'brisk-ts-extends/is';
import * as path from 'path';
// 配置is扩展的接口json文件
IS_CONFIG_PATH(path.join(__dirname, './interface.json'));

import { BriskPlugin, Core } from 'brisk-ioc';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ControllerCore } from '@core';
import createError from 'http-errors';
import SwaggerUI from 'swagger-ui-express';
import multer from 'multer';
import { BriskSwgger } from '@core/BriskSwgger';
import { ControllerPluginOption } from '@interface';

// 核心
export * from '@core';

// 装饰器
export * from '@decorator';

// 枚举
export * from '@enum';


// 接口
export * from '@interface';


/**
 * Brisk-Controller
 * License MIT
 * Copyright (c) 2021 Ruixiaozi
 * admin@ruixiaozi.com
 * https://github.com/ruixiaozi/brisk-controller
 */
class _ControllerPlugin implements BriskPlugin {

  #controllerCore: ControllerCore = ControllerCore.getInstance();

  name = 'BriskController';

  install(core: Core, option: ControllerPluginOption = {
    port: 3000,
    priority: 3000,
    cors: false,
    baseUrl: '/',
  }): void {
    if (!is<ControllerPluginOption>(option, 'ControllerPluginOption')) {
      this.#controllerCore.logger.error('plugin option format error');
      return;
    }
    this.#controllerCore.app = express();
    this.#controllerCore.port = option.port;
    this.#controllerCore.priority = option.priority;
    this.#controllerCore.baseUrl = option.baseUrl;
    // 继承ioc的isdebug
    this.#controllerCore.isDebug = core.isDebug;

    // CORS
    if (option.cors) {
      this.#controllerCore.isDebug && this.#controllerCore.logger.debug('use cors...');
      this.#controllerCore.app.use(cors({
        // 指定接收的地址
        origin: [/.*/u],
        // 指定接收的请求类型
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
        // 指定header
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      }));
    }
    // JSON
    this.#controllerCore.app.use(express.json(option.limit ? { limit: option.limit } : {}));
    // url
    this.#controllerCore.app.use(express.urlencoded({ extended: false }));
    // cookie
    this.#controllerCore.app.use(cookieParser());
    // static
    if (option.staticPath) {
      this.#controllerCore.app.use(express.static(option.staticPath));
    }
    this.#controllerCore.app.use(multer().any());

    // 将扫描控制器放入初始化
    core.putInitFunc({
      fn: this.#controllerCore.scanController.bind(this.#controllerCore),
      priority: this.#controllerCore.priority,
    });

    if (option.swagger?.enable) {
      core.putInitFunc({
        fn: () => {
          const briskSwgger = BriskSwgger.getInstance().configurate(option.swagger!);
          // 挂载swagger
          this.#controllerCore?.app?.use(
            briskSwgger.getSwggerUrl(),
            SwaggerUI.serve,
            SwaggerUI.setup(briskSwgger.getSwggerData()),
          );
        },
        priority: this.#controllerCore.priority! + 1,
      });
    }

    this.#controllerCore.isInstall = true;
  }

  start() {
    if (!this.#controllerCore.isInstall || !this.#controllerCore.app) {
      this.#controllerCore.logger.error('no install brisk-controller');
      return;
    }

    // 没有匹配的路由，则走到这里
    this.#controllerCore.app.use((req: Request, res: Response, next: NextFunction) => {
      next(createError(404));
    });

    // 所有报错
    this.#controllerCore.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = this.#controllerCore.isDebug ? err : {};
      const errorJson = JSON.stringify(err, null, 2);
      this.#controllerCore.logger.error(`${req.method} ${req.path} ${err.status || 500} \n${errorJson}`);

      next;
      // render the error page
      res.status(err.status || 500);
      res.json(err);
    });
    this.#controllerCore.app.listen(this.#controllerCore.port);
    this.#controllerCore.logger.info(`listen to ${this.#controllerCore.port}`);
    this.#controllerCore.logger.info(`http://localhost:${this.#controllerCore.port}`);
  }

}

export const BriskController = new _ControllerPlugin();

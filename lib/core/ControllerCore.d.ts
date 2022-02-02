import { Core } from "brisk-ioc/lib/core/Core";
import { Express, RequestHandler } from "express";
/**
 * ControllerCore
 * @description 控制器核心类
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 10:25:36
 * @version 2.0.0
 */
export declare class ControllerCore {
    private static instance?;
    static getInstance(): ControllerCore;
    core?: Core;
    app?: Express;
    port?: number;
    priority?: number;
    scanController(): void;
    routerFactory(controller: any, fn: Function): RequestHandler;
}

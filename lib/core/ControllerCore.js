"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerCore = void 0;
const express_1 = __importDefault(require("express"));
const IRequestMappingOption_1 = require("../interface/option/IRequestMappingOption");
/**
 * ControllerCore
 * @description 控制器核心类
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 10:25:36
 * @version 2.0.0
 */
class ControllerCore {
    static getInstance() {
        if (!ControllerCore.instance)
            ControllerCore.instance = new ControllerCore();
        return ControllerCore.instance;
    }
    scanController() {
        if (!this.core || !this.app) {
            return;
        }
        console.log("scanController...");
        //添加前置拦截器
        [...this.core.container.entries()]
            .filter(([key]) => key.toString().indexOf("routerfilter-") > -1)
            .forEach(([key, bean]) => {
            let { routerFilter, path } = bean;
            if (typeof routerFilter["before"] === "function") {
                let fn = routerFilter["before"];
                this.app.all(path, this.routerFactory(routerFilter, fn));
            }
        });
        //扫描并注册控制器
        [...this.core.container.entries()]
            .filter(([key]) => key.toString().indexOf("controller-") > -1)
            .forEach(([key, bean]) => {
            var _a;
            //创建控制器
            let { controller, path } = bean;
            console.log("controller :" + path);
            //添加路由(遍历所有方法)
            let router = express_1.default.Router();
            (_a = controller.$routers) === null || _a === void 0 ? void 0 : _a.forEach((rt) => {
                switch (rt.method) {
                    case IRequestMappingOption_1.Method.GET:
                        router.get(rt.path, this.routerFactory(controller, rt.fn));
                        console.log("   router get:" + rt.path);
                        break;
                    case IRequestMappingOption_1.Method.POST:
                        router.post(rt.path, this.routerFactory(controller, rt.fn));
                        console.log("   router post:" + rt.path);
                        break;
                    case IRequestMappingOption_1.Method.PUT:
                        router.put(rt.path, this.routerFactory(controller, rt.fn));
                        console.log("   router put:" + rt.path);
                        break;
                    case IRequestMappingOption_1.Method.DELETE:
                        router.delete(rt.path, this.routerFactory(controller, rt.fn));
                        console.log("   router delete:" + rt.path);
                        break;
                    case IRequestMappingOption_1.Method.All:
                        router.all(rt.path, this.routerFactory(controller, rt.fn));
                        console.log("   router all:" + rt.path);
                        break;
                    //no default
                }
            });
            this.app.use(path, router);
        });
    }
    routerFactory(controller, fn) {
        return async function (req, res, next) {
            let result = fn.call(controller, {
                req,
                res,
                next,
                params: req.params,
                body: req.body,
                query: req.query,
                cookies: req.cookies,
                originalUrl: req.originalUrl,
                headers: req.headers,
            });
            if (result && result.constructor.name == "Promise") {
                result = await result;
            }
            console.log(result);
            if (result && result.type && result.content) {
                switch (result.type) {
                    case "json":
                        res.status(result.code ? result.code : 200);
                        res.json(result.content);
                        break;
                    case "redirect":
                        res.redirect(result.content);
                        break;
                    case "render":
                        res.status(result.code ? result.code : 200);
                        res.render(result.content);
                }
            }
        };
    }
}
exports.ControllerCore = ControllerCore;

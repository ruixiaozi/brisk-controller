"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteFilter = exports.RequestMapping = exports.Controller = void 0;
const RouterFilterBean_1 = require("./../entity/bean/RouterFilterBean");
const ControllerBean_1 = require("../entity/bean/ControllerBean");
const brisk_ioc_1 = require("brisk-ioc");
const ControllerCore_1 = require("../core/ControllerCore");
/**
 * 控制器 装饰器工厂
 * @description 仅支持类
 * @param {Object} option 选项 {path?='/' 路由路径}
 * @returns
 */
function Controller(option) {
    return new brisk_ioc_1.DecoratorFactory()
        .setClassCallback((target) => {
        var _a;
        let bean = new ControllerBean_1.ControllerBean(new target(), option.path);
        //将controller添加到容器中
        (_a = ControllerCore_1.ControllerCore.getInstance().core) === null || _a === void 0 ? void 0 : _a.container.set(`controller-${new Date().getTime()}`, bean);
    })
        .getDecorator();
}
exports.Controller = Controller;
/**
 * 路由 装饰器工厂
 * @description 仅支持静态方法
 * @param {Object} option 选项 {path 路由路径, method?=Method.All 请求方法 }
 * @returns
 */
function RequestMapping(option) {
    return new brisk_ioc_1.DecoratorFactory()
        .setMethodCallback((target, key, descriptor) => {
        if (typeof descriptor.value === "function") {
            if (!target.$routers)
                target.$routers = [];
            target.$routers.push({
                path: option.path,
                method: option.method,
                fn: descriptor.value.bind(target),
            });
        }
    })
        .getDecorator();
}
exports.RequestMapping = RequestMapping;
/**
 * 过滤器 装饰器
 * @description 仅支持类
 * @param {Object} option 选项 {path?='/*' 路由路径}
 * @returns
 */
function RouteFilter(option) {
    return new brisk_ioc_1.DecoratorFactory()
        .setClassCallback((target) => {
        var _a;
        let bean = new RouterFilterBean_1.RouterFilterBean(new target(), option.path);
        //将routerfilter添加到容器中
        (_a = ControllerCore_1.ControllerCore.getInstance().core) === null || _a === void 0 ? void 0 : _a.container.set(`routerfilter-${new Date().getTime()}`, bean);
    })
        .getDecorator();
}
exports.RouteFilter = RouteFilter;

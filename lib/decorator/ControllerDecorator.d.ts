import { RouterFilterOption } from "../entity/option/RouterFilterOption";
import { RequestMappingOption } from "../entity/option/RequestMappingOption";
import { Decorator } from "brisk-ioc";
import { ControllerOption } from "../entity/option/ControllerOption";
/**
 * 控制器 装饰器工厂
 * @description 仅支持类
 * @param {Object} option 选项 {path?='/' 路由路径}
 * @returns
 */
export declare function Controller(option: ControllerOption): Decorator;
/**
 * 路由 装饰器工厂
 * @description 仅支持静态方法
 * @param {Object} option 选项 {path 路由路径, method?=Method.All 请求方法 }
 * @returns
 */
export declare function RequestMapping(option: RequestMappingOption): Decorator;
/**
 * 过滤器 装饰器
 * @description 仅支持类
 * @param {Object} option 选项 {path?='/*' 路由路径}
 * @returns
 */
export declare function RouteFilter(option: RouterFilterOption): Decorator;

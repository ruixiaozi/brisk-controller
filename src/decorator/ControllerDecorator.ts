import { RouterFilterOption } from "./../entity/RouterFilterOption";
import { RequestMappingOption } from "./../entity/RequestMappingOption";
import { Bean, BeanOption, DecoratorFactory } from "brisk-ioc";
import { ControllerOption } from "./../entity/ControllerOption";
/**
 * 控制器 装饰器
 * @description 仅支持类
 * @param {Object} option 选项 {path?='/' 路由路径}
 * @returns
 */
export function Controller(option: ControllerOption): Function {
  return new DecoratorFactory()
    .setClassCallback((target) => {
      target.prototype.path = option.path;
      Bean(new BeanOption("controller-"))(target);
    })
    .getDecorator();
}

/**
 * 路由 装饰器
 * @description 仅支持静态方法
 * @param {Object} option 选项 {path 路由路径, method?=Method.All 请求方法 }
 * @returns
 */
export function RequestMapping(option: RequestMappingOption): Function {
  return new DecoratorFactory()
    .setMethodCallback((target, key, descriptor) => {
      descriptor.enumerable = true;
      descriptor.value.path = option.path;
      descriptor.value.method = option.method;
    })
    .getDecorator();
}

/**
 * 过滤器 装饰器
 * @description 仅支持类
 * @param {Object} option 选项 {path?='/*' 路由路径}
 * @returns
 */
export function RouteFilter(option: RouterFilterOption): Function {
  return new DecoratorFactory()
    .setClassCallback((target) => {
      target.prototype.path = option.path;
      Bean(new BeanOption("routerfilter-"))(target);
    })
    .getDecorator();
}

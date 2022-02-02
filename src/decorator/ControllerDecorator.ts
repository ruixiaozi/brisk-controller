import { RouterFilterBean } from "./../entity/bean/RouterFilterBean";
import { ControllerBean } from "../entity/bean/ControllerBean";
import { RouterFilterOption } from "../entity/option/RouterFilterOption";
import { RequestMappingOption } from "../entity/option/RequestMappingOption";
import { Decorator, DecoratorFactory } from "brisk-ioc";
import { ControllerOption } from "../entity/option/ControllerOption";
import { ControllerCore } from "../core/ControllerCore";

/**
 * 控制器 装饰器工厂
 * @description 仅支持类
 * @param {Object} option 选项 {path?='/' 路由路径}
 * @returns
 */
export function Controller(option: ControllerOption): Decorator {
  return new DecoratorFactory()
    .setClassCallback((target) => {
      let bean = new ControllerBean(new target(), option.path);
      //将controller添加到容器中
      ControllerCore.getInstance().core?.container.set(
        `controller-${new Date().getTime()}`,
        bean
      );
    })
    .getDecorator();
}

/**
 * 路由 装饰器工厂
 * @description 仅支持静态方法
 * @param {Object} option 选项 {path 路由路径, method?=Method.All 请求方法 }
 * @returns
 */
export function RequestMapping(option: RequestMappingOption): Decorator {
  return new DecoratorFactory()
    .setMethodCallback((target, key, descriptor) => {

      if (typeof descriptor.value === "function") {
        if (!target.$routers) target.$routers = [];

        target.$routers.push({
          path: option.path,
          method: option.method,
          fn: descriptor.value.bind(target),
        });
      }
    })
    .getDecorator();
}

/**
 * 过滤器 装饰器
 * @description 仅支持类
 * @param {Object} option 选项 {path?='/*' 路由路径}
 * @returns
 */
export function RouteFilter(option: RouterFilterOption): Decorator {
  return new DecoratorFactory()
    .setClassCallback((target) => {
      let bean = new RouterFilterBean(new target(), option.path);
      //将routerfilter添加到容器中
      ControllerCore.getInstance().core?.container.set(
        `routerfilter-${new Date().getTime()}`,
        bean
      );
    })
    .getDecorator();
}

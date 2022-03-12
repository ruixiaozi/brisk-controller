import { RouterFilterBean } from './../entity/bean/RouterFilterBean';
import { ControllerBean } from '../entity/bean/ControllerBean';
import { RouterFilterOption } from '../entity/option/RouterFilterOption';
import { Decorator, DecoratorFactory } from 'brisk-ioc';
import { ControllerOption } from '../entity/option/ControllerOption';
import { ControllerCore } from '../core/ControllerCore';
import { IRequestMappingOption } from '../interface/option/IRequestMappingOption';
import { IControllerOption } from '../interface/option/IControllerOption';
import { IRouterFilterOption } from '../interface/option/IRouterFilterOption';

/**
 * 控制器 装饰器工厂
 * @description 仅支持类
 * @param {IControllerOption} option 选项
 * @returns
 */
export function Controller(option?: IControllerOption): Decorator {
  const controllerOption = option || new ControllerOption();
  return new DecoratorFactory()
    .setClassCallback((Target) => {
      let controller = new Target();
      let bean = new ControllerBean(controller, controllerOption!.path);
      // 将controller添加到容器中
      ControllerCore.getInstance().core?.container.set(
        `controller-${new Date().getTime()}`,
        bean,
      );
    })
    .getDecorator();
}

/**
 * 路由 装饰器工厂
 * @description 仅支持静态方法
 * @param {IRequestMappingOption} option 选项
 * @returns
 */
export function RequestMapping(option: IRequestMappingOption): Decorator {
  return new DecoratorFactory()
    .setMethodCallback((target, key, descriptor) => {
      if (typeof descriptor.value === 'function') {
        if (!target.$routers) {
          target.$routers = [];
        }
        target.$routers.push({
          path: option.path,
          method: option.method,
          fn: descriptor.value,
        });
      }
    })
    .getDecorator();
}

/**
 * 过滤器 装饰器
 * @description 仅支持类
 * @param {IRouterFilterOption} option 选项
 * @returns
 */
export function RouteFilter(option?: IRouterFilterOption): Decorator {
  const routerFilterOption = option || new RouterFilterOption();
  return new DecoratorFactory()
    .setClassCallback((Target) => {
      let bean = new RouterFilterBean(new Target(), routerFilterOption!.path);
      // 将routerfilter添加到容器中
      ControllerCore.getInstance().core?.container.set(
        `routerfilter-${new Date().getTime()}`,
        bean,
      );
    })
    .getDecorator();
}

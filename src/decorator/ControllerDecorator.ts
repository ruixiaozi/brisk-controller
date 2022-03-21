import { RuleCollection, RuleObject, ParamTypeEnum } from './../interface/option/IRequestMappingOption';
import { RouterFilterBean } from './../entity/bean/RouterFilterBean';
import { ControllerBean } from '../entity/bean/ControllerBean';
import { RouterFilterOption } from '../entity/option/RouterFilterOption';
import { Decorator, DecoratorFactory } from 'brisk-ioc';
import { ControllerOption } from '../entity/option/ControllerOption';
import { ControllerCore } from '../core/ControllerCore';
import { IRequestMappingOption } from '../interface/option/IRequestMappingOption';
import { IControllerOption } from '../interface/option/IControllerOption';
import { IRouterFilterOption } from '../interface/option/IRouterFilterOption';
import * as path from 'path';

/**
 * 控制器 装饰器工厂
 * @description 仅支持类
 * @param {IControllerOption} option 选项
 * @returns
 */
export function Controller(option?: IControllerOption): Decorator {
  const controllerOption: IControllerOption = option || new ControllerOption();
  return new DecoratorFactory()
    .setClassCallback((Target) => {
      let controller = new Target();

      let bean = new ControllerBean(controller, controllerOption.path);
      const controllerCore = ControllerCore.getInstance();
      // 将controller添加到容器中
      controllerCore.core?.container.set(
        `controller-${Target.name}`,
        bean,
      );

      // swagger
      if (controllerCore.swaggerObj?.tags) {
        controllerCore.swaggerObj?.tags.push({
          name: Target.name,
          description: controllerOption.description || '',
        });
        controllerCore.logger.debug(`swagger: create tags [${Target.name}]`);
      }

      if (controllerCore.swaggerObj?.paths) {
        const routers:any[] = controller.$routers || [];

        routers.forEach((router) => {
          let params: any[] = [];
          Object.entries(router.rules as RuleCollection).forEach(([keyIn, value]) => {
            Object.entries(value as RuleObject | ParamTypeEnum).forEach(([name, desc]) => {
              params.push({
                name,
                in: keyIn,
                required: desc.required || false,
                type: desc.type || desc,
              });
            });
          });

          const fullPath = path.posix.join(controllerOption.path, router.path);
          controllerCore.swaggerObj.paths[fullPath] = controllerCore.swaggerObj.paths[fullPath] || {};

          controllerCore.swaggerObj.paths[fullPath][router.method] = {
            tags: [Target.name],
            summary: router.name,
            description: router.description,
            parameters: params,
          };
          controllerCore.logger.debug(`swagger: create path [${fullPath} ${router.method}]`);
        });
      }
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
          name: option.name || descriptor.value.name,
          descriptor: option.description || '',
          rules: {
            header: option.header || {},
            query: option.query || {},
            formData: option.formData || {},
            body: option.body || {},
          } as RuleCollection,

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

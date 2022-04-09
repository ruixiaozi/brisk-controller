import {
  ControllerBean,
  ControllerParameter,
  ParameterOption,
  ControllerOption,
  RequestMappingOption,
  ControllerRouter,
  InterceptorOption,
  InterceptorRouter,
  InterceptorMappingOption,
  InterceptorBean,

} from '@interface';
import * as path from 'path';
import { BriskIoC } from 'brisk-ioc';
import { ControllerCore } from '@core';
import { Decorator, Key } from 'brisk-ts-extends/types';
import { DecoratorFactory } from 'brisk-ts-extends/decorator';
import { camelCase as _camelCase } from 'lodash';
import { ParamInEnum, MetaKeyEnum, ParamTypeEnum } from '@enum';
import { BriskSwgger } from '@core/BriskSwgger';

/**
 * 1.参数装饰器，然后依次是方法装饰器，访问符装饰器，或属性装饰器应用到每个实例成员。
 * 2.参数装饰器，然后依次是方法装饰器，访问符装饰器，或属性装饰器应用到每个静态成员。
 * 3.参数装饰器应用到构造函数。
 * 4.类装饰器应用到类。
 *
 * 当我们为类使用装饰器时，只会为类添加上 ”design:paramtypes” 的元数据信息，含义为其构造函数的传入参数的类型数组
 * 当我们为类中的属性使用装饰器时，只会为该属性添加上 ”design:type” 的元数据，含义为该属性的类型
 * 当我们为类中的方法/参数使用装饰器时，会为该属性添加上所有三种保留元数据键，含义分别为方法的类型，传入该方法的形参类型数组，该方法的返回值的类型
 */

function _reflectParameter(
  paramIn: ParamInEnum,
  target: any,
  key: Key,
  index: number,
  paramName: string,
  option?: ParameterOption,
) {
  const paramtypes = Reflect.getMetadata('design:paramtypes', target, key);
  let params: ControllerParameter[] = Reflect.getMetadata(MetaKeyEnum.PARAMETERS_META_KEY, target, key);
  if (!params) {
    params = [];
    Reflect.defineMetadata(MetaKeyEnum.PARAMETERS_META_KEY, params, target, key);
  }
  params.push({
    in: paramIn,
    type: paramtypes[index].name,
    paramIndex: index,
    paramName,
    option,
  });
}

/**
 * Body参数装饰器工厂
 * @description 仅支持参数
 * @param {ParameterOption} option 选项
 * @returns
 */
export function FromBody(option?: ParameterOption): Decorator {
  return new DecoratorFactory()
    .setParamCallback((target, key, index, paramName) => {
      _reflectParameter(ParamInEnum.BODY, target, key, index, paramName, option);
    })
    .getDecorator();
}

/**
 * FormData参数装饰器工厂
 * @description 仅支持参数
 * @param {ParameterOption} option 选项
 * @returns
 */
export function FromFormData(option?: ParameterOption): Decorator {
  return new DecoratorFactory()
    .setParamCallback((target, key, index, paramName) => {
      _reflectParameter(ParamInEnum.FORM_DATA, target, key, index, paramName, option);
    })
    .getDecorator();
}

/**
 * File参数装饰器工厂
 * @description 仅支持参数
 * @param {ParameterOption} option 选项
 * @returns
 */
export function FromFile(option?: ParameterOption): Decorator {
  return new DecoratorFactory()
    .setParamCallback((target, key, index, paramName) => {
      _reflectParameter(ParamInEnum.FILE, target, key, index, paramName, option);
    })
    .getDecorator();
}

/**
 * Query参数装饰器工厂
 * @description 仅支持参数
 * @param {ParameterOption} option 选项
 * @returns
 */
export function FromQuery(option?: ParameterOption): Decorator {
  return new DecoratorFactory()
    .setParamCallback((target, key, index, paramName) => {
      _reflectParameter(ParamInEnum.QUERY, target, key, index, paramName, option);
    })
    .getDecorator();
}

/**
 * Path装饰器工厂
 * @description 仅支持参数
 * @param {ParameterOption} option 选项
 * @returns
 */
export function FromPath(option?: ParameterOption): Decorator {
  return new DecoratorFactory()
    .setParamCallback((target, key, index, paramName) => {
      _reflectParameter(ParamInEnum.PATH, target, key, index, paramName, option);
    })
    .getDecorator();
}

/**
 * Header装饰器工厂
 * @description 仅支持参数
 * @param {ParameterOption} option 选项
 * @returns
 */
export function FromHeader(option?: ParameterOption): Decorator {
  return new DecoratorFactory()
    .setParamCallback((target, key, index, paramName) => {
      _reflectParameter(ParamInEnum.HEADER, target, key, index, paramName, option);
    })
    .getDecorator();
}


/**
 * 路由 装饰器工厂
 * @description 仅支持方法
 * @param {RequestMappingOption} option 选项
 * @returns
 */
export function RequestMapping(option: RequestMappingOption): Decorator {
  return new DecoratorFactory()
    .setMethodCallback((target, key, descriptor, paramNames) => {
      if (typeof descriptor.value === 'function') {
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, key).map((item: any) => item.name);
        let routers: ControllerRouter[] = Reflect.getMetadata(MetaKeyEnum.ROUTER_META_KEY, target);
        if (!routers) {
          routers = [];
          Reflect.defineMetadata(MetaKeyEnum.ROUTER_META_KEY, routers, target);
        }

        routers.push({
          paramNames,
          paramTypes,
          fn: descriptor.value,
          key,
          option,
        });
      }
    })
    .getDecorator();
}

/**
 * 控制器 装饰器工厂
 * @description 仅支持类
 * @param {ControllerOption} option 选项
 * @returns
 */
export function Controller(option: ControllerOption = { path: '/' }): Decorator {
  return new DecoratorFactory()
    .setClassCallback((Target) => {
      const bean: ControllerBean = {
        controller: new Target(),
        target: Target.prototype,
        option,
      };
      // 将controller添加到容器中
      BriskIoC.core.putBean(_camelCase(Target.name), bean, ControllerCore.controllerRegion);

      const briskSwgger = BriskSwgger.getInstance();

      briskSwgger.putTag({
        name: Target.name,
        description: option.description,
      });

      let routers: ControllerRouter[] = Reflect.getMetadata(MetaKeyEnum.ROUTER_META_KEY, bean.target);
      routers.forEach((router) => {
        const params:ControllerParameter[] = Reflect.getMetadata(MetaKeyEnum.PARAMETERS_META_KEY, bean.target, router.key);

        briskSwgger.putOperation(
          path.posix.join(option.path, router.option.path),
          router.option.method,
          {
            tags: [Target.name],
            summary: router.option.name || '',
            description: router.option.description || '',
            parameters: params.map((item) => ({
              in: item.in,
              name: item.option?.name || item.paramName,
              required: item.option?.required ?? false,
              type: router.paramTypes[item.paramIndex].toLowerCase() as ParamTypeEnum,
              // default 还需要处理
            })),
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        );
      });
    })
    .getDecorator();
}


/**
 * 拦截器路由 装饰器工厂
 * @description 仅支持方法
 * @param {InterceptorMappingOption} option 选项
 * @returns
 */
export function InterceptorMapping(option: InterceptorMappingOption): Decorator {
  return new DecoratorFactory()
    .setMethodCallback((target, key, descriptor, paramNames) => {
      if (typeof descriptor.value === 'function') {
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, key).map((item: any) => item.name);
        let routers: InterceptorRouter[] = Reflect.getMetadata(MetaKeyEnum.ROUTER_META_KEY, target);
        if (!routers) {
          routers = [];
          Reflect.defineMetadata(MetaKeyEnum.ROUTER_META_KEY, routers, target);
        }

        routers.push({
          paramNames,
          paramTypes,
          fn: descriptor.value,
          key,
          option,
        });
      }
    })
    .getDecorator();
}


/**
 * Interceptor
 * 过滤器 装饰器
 * @description 仅支持类
 * @param {InterceptorOption} option 选项
 * @returns
 */
export function Interceptor(option: InterceptorOption): Decorator {
  return new DecoratorFactory()
    .setClassCallback((Target) => {
      const bean: InterceptorBean = {
        interceptor: new Target(),
        target: Target.prototype,
        option,
      };
      // 将interceptor添加到容器中
      BriskIoC.core.putBean(_camelCase(Target.name), bean, ControllerCore.interceptorRegion);
    })
    .getDecorator();
}


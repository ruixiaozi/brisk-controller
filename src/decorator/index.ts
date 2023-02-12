import { setBean } from 'brisk-ioc';
import { DecoratorFactory } from 'brisk-ts-extends';
import { addInterceptor, addRequest } from '../core';
import {
  BriskControllerDecoratorInterceptor,
  BriskControllerDecoratorOption,
  BriskControllerDecoratorParam,
  BriskControllerDecoratorRequest,
  BRISK_CONTROLLER_PARAMETER_IS_E,
} from '../types';

const defaultRegion = Symbol('briskController');

enum BRISK_CONTROLLER_DECORATOR_ROUTE_TYPE_E {
  REQUEST,
  INTERCEPTOR,
}

/**
 * 控制器类 装饰器
 * @param baseUrl 当前类下的所有request和interceptor的基地址
 * @param option 选项
 * @returns
 */
export function Controller(baseUrl?: string, option?: BriskControllerDecoratorOption): Function {
  return new DecoratorFactory()
    .setClassCallback((Target, targetTypeDes) => {
      const target = new Target();
      setBean(Target, target, defaultRegion);
      if (targetTypeDes) {
        targetTypeDes.functions.filter((item) => item.meta).forEach((item) => {
          if (item.meta.type === BRISK_CONTROLLER_DECORATOR_ROUTE_TYPE_E.REQUEST) {
            addRequest(item.meta.path, item.meta.handler.bind(target), {
              method: item.meta.method,
              title: item.meta.title,
              description: item.meta.description,
              params: item.meta.params,
              baseUrl,
              tag: option?.tag || { name: Target.name },
              name: item.meta.name,
            });
          } else if (item.meta.type === BRISK_CONTROLLER_DECORATOR_ROUTE_TYPE_E.INTERCEPTOR) {
            addInterceptor(item.meta.path, item.meta.handler.bind(target), {
              method: item.meta.method,
              baseUrl,
            });
          }
        });
      }
    })
    .getDecorator();
}

function generateParamDecorator(is: BRISK_CONTROLLER_PARAMETER_IS_E, option?: BriskControllerDecoratorParam) {
  return new DecoratorFactory()
    .setParamCallback((target, key, index, param) => {
      if (param) {
        param.meta = {
          name: option?.name || param.key,
          is,
          description: option?.description,
          required: !param.option,
          type: Array.isArray(param.type) ? param.type[0] : param.type,
          default: param.default,
          validator: option?.validator,
        };
      }
    })
    .getDecorator();
}

/**
 * Body参数 装饰器
 * @param {option} BriskControllerDecoratorParam 选项
 * @returns
 */
export function Body(option?: BriskControllerDecoratorParam): Function {
  return generateParamDecorator(BRISK_CONTROLLER_PARAMETER_IS_E.BODY, option);
}

/**
 * InBody参数 装饰器
 * @param {option} BriskControllerDecoratorParam 选项
 * @returns
 */
export function InBody(option?: BriskControllerDecoratorParam): Function {
  return generateParamDecorator(BRISK_CONTROLLER_PARAMETER_IS_E.IN_BODY, option);
}

/**
 * InQuery参数 装饰器
 * @param {option} BriskControllerDecoratorParam 选项
 * @returns
 */
export function InQuery(option?: BriskControllerDecoratorParam): Function {
  return generateParamDecorator(BRISK_CONTROLLER_PARAMETER_IS_E.QUERY, option);
}

/**
 * InFormData参数 装饰器
 * @param {option} BriskControllerDecoratorParam 选项
 * @returns
 */
export function InFormData(option?: BriskControllerDecoratorParam): Function {
  return generateParamDecorator(BRISK_CONTROLLER_PARAMETER_IS_E.FORM_DATA, option);
}

/**
 * InHeader参数 装饰器
 * @param {option} BriskControllerDecoratorParam 选项
 * @returns
 */
export function InHeader(option?: BriskControllerDecoratorParam): Function {
  return generateParamDecorator(BRISK_CONTROLLER_PARAMETER_IS_E.HEADER, option);
}

/**
 * InPath参数 装饰器
 * @param {option} BriskControllerDecoratorParam 选项
 * @returns
 */
export function InPath(option?: BriskControllerDecoratorParam): Function {
  return generateParamDecorator(BRISK_CONTROLLER_PARAMETER_IS_E.PATH, option);
}

/**
 * InFile参数 装饰器
 * @param {option} BriskControllerDecoratorParam 选项
 * @returns
 */
export function InFile(option?: BriskControllerDecoratorParam): Function {
  return generateParamDecorator(BRISK_CONTROLLER_PARAMETER_IS_E.FILE, option);
}

/**
 * InCookie参数 装饰器
 * @param {option} BriskControllerDecoratorParam 选项
 * @returns
 */
export function InCookie(option?: BriskControllerDecoratorParam): Function {
  return generateParamDecorator(BRISK_CONTROLLER_PARAMETER_IS_E.COOKIE, option);
}

/**
 * 请求映射 方法装饰器
 * @param path 路由路径
 * @param option 选项
 * @returns
 */
export function RequestMapping(path: string, option?: BriskControllerDecoratorRequest): Function {
  return new DecoratorFactory()
    .setMethodCallback((target, key, descriptor, functionsDes) => {
      if (functionsDes) {
        functionsDes.meta = {
          type: BRISK_CONTROLLER_DECORATOR_ROUTE_TYPE_E.REQUEST,
          path,
          handler: descriptor.value,
          method: option?.method,
          name: option?.name || functionsDes.name,
          title: option?.title,
          description: option?.description,
          params: functionsDes.params.map((item) => item.meta || {
            name: item.key,
            is: BRISK_CONTROLLER_PARAMETER_IS_E.NULL,
          }) || [],
        };
      };
    })
    .getDecorator();
}

/**
 * 拦截器 方法装饰器
 * @param path 路由路径
 * @param option 选项
 * @returns
 */
export function Interceptor(path: string, option?: BriskControllerDecoratorInterceptor): Function {
  return new DecoratorFactory()
    .setMethodCallback((target, key, descriptor, functionsDes) => {
      if (functionsDes) {
        functionsDes.meta = {
          type: BRISK_CONTROLLER_DECORATOR_ROUTE_TYPE_E.INTERCEPTOR,
          path,
          handler: descriptor.value,
          method: option?.method,
        };
      }
    })
    .getDecorator();
}

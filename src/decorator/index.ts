import { setBean } from 'brisk-ioc';
import { DecoratorFactory } from 'brisk-ts-extends';
import { getParentTypeKind, getSubTypeKind } from 'brisk-ts-extends/runtime';
import { addHook, addInterceptor, addRequest } from '../core';
import {
  BriskControllerDecoratorInterceptor,
  BriskControllerDecoratorOption,
  BriskControllerDecoratorParam,
  BriskControllerDecoratorRequest,
  BRISK_CONTROLLER_PARAMETER_IS_E,
} from '../types';


enum BRISK_CONTROLLER_DECORATOR_ROUTE_TYPE_E {
  INTERCEPTOR = '0',
  REQUEST = '1',
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
      // 存到容器中，方便其他地方注入controller
      setBean(Target, target);
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
              successResponseType: item.meta.return,
              redirect: item.meta.redirect,
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
 * State 装饰器，用于拦截器、转发请求传递数据
 * @returns
 */
export function State(): Function {
  return new DecoratorFactory()
    .setParamCallback((target, key, index, param) => {
      if (param) {
        param.meta = {
          name: param.key,
          is: BRISK_CONTROLLER_PARAMETER_IS_E.STATE,
          type: Array.isArray(param.type) ? param.type[0] : param.type,
        };
      }
    })
    .getDecorator();
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
          redirect: option?.redirect,
          params: functionsDes.params.map((item) => item.meta || {
            name: item.key,
            is: BRISK_CONTROLLER_PARAMETER_IS_E.NULL,
            type: '__NULL__',
          }) || [],
          // 如果时Promise，返回子类型
          return: getParentTypeKind(functionsDes.returnType) === 'Promise'
            ? getSubTypeKind(functionsDes.returnType)
            : functionsDes.returnType,
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


/**
 * 控制层启动前
 * @param priority 优先级，默认10
 * @returns
 */
export function BeforeControllerStart(priority: number = 10): Function {
  return new DecoratorFactory()
    .setMethodCallback((target, key, descriptor) => {
      addHook('before_start', {
        priority,
        handler: descriptor.value?.bind(target),
      });
    })
    .getDecorator();
}

/**
 * 控制层启动后
 * @param priority 优先级，默认10
 * @returns
 */
export function AfterControllerStart(priority: number = 10): Function {
  return new DecoratorFactory()
    .setMethodCallback((target, key, descriptor) => {
      addHook('after_start', {
        priority,
        handler: descriptor.value?.bind(target),
      });
    })
    .getDecorator();
}

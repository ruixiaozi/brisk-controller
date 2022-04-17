import { MetaKeyEnum, ParamInEnum, ParamTypeEnum } from '@enum';
import {
  ControllerBean,
  ControllerFile,
  ControllerParameter,
  ControllerRouter,
  InterceptorBean,
  InterceptorRouter,
} from '@interface';
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

export class RouterCbFactory {

  static #transformType(value: string, type: ParamTypeEnum) {
    switch (type) {
      case ParamTypeEnum.Boolean:
        return Boolean(value);
      case ParamTypeEnum.Integer:
      case ParamTypeEnum.Number:
        return Number(value);
      case ParamTypeEnum.Array:
        return value.split(',');
      default:
        return value;
    }
  }

  static #paramsValidate(truthParams: any[], controllerRouter: ControllerRouter, params?: ControllerParameter[]): boolean {
    for (let i = 0; i < controllerRouter.paramTypes.length; i++) {
      // 空值判断
      if (truthParams[i] === undefined || truthParams[i] === null) {
        const param = params?.find((item) => item.paramIndex === i);
        if (param?.option?.required) {
          return false;
        }
        // 非必选则跳过验证
        continue;
      }
      const type = controllerRouter.paramTypes[i].toLocaleLowerCase();
      switch (type) {
        case ParamTypeEnum.String:
          if (typeof truthParams[i] !== ParamTypeEnum.String) {
            return false;
          }
          break;
        case ParamTypeEnum.Boolean:
          if (!/^(?:true|false)$/u.test(truthParams[i].toString())) {
            return false;
          }
          if (typeof truthParams[i] === ParamTypeEnum.String) {
            truthParams[i] = this.#transformType(truthParams[i], ParamTypeEnum.Boolean);
          }
          break;
        case ParamTypeEnum.Integer:
          if (!/^\d+$/u.test(truthParams[i].toString())) {
            return false;
          }
          if (typeof truthParams[i] === ParamTypeEnum.String) {
            truthParams[i] = this.#transformType(truthParams[i], ParamTypeEnum.Integer);
          }
          break;
        case ParamTypeEnum.Number:
          if (Number.isNaN(Number(truthParams[i].toString()))) {
            return false;
          }
          if (typeof truthParams[i] === ParamTypeEnum.String) {
            truthParams[i] = this.#transformType(truthParams[i], ParamTypeEnum.Number);
          }
          break;
        case ParamTypeEnum.Array:
          if (!Array.isArray(truthParams[i]) && !/^[^,]+,(?:[^,]+,*)+$/u.test(truthParams[i].toString())) {
            return false;
          }
          if (typeof truthParams[i] === ParamTypeEnum.String) {
            truthParams[i] = this.#transformType(truthParams[i], ParamTypeEnum.Array);
          }
          break;
        // no default
      }
    }
    return true;
  }

  public static getControllerCb(
    req: Request,
    res: Response,
    next: NextFunction,
    controllerBean: ControllerBean,
    controllerRouter: ControllerRouter,
  ): Function {
    const params: ControllerParameter[] | undefined = Reflect.getMetadata(
      MetaKeyEnum.PARAMETERS_META_KEY,
      controllerBean.target,
      controllerRouter.key,
    );
    const truthParams: any[] = [];
    for (let i = 0; i < controllerRouter.paramNames.length; i++) {
      const param = params?.find((item) => item.paramIndex === i);
      if (param) {
        const paramName = param.option?.name || param.paramName;
        switch (param.in) {
          case ParamInEnum.BODY:
          case ParamInEnum.FORM_DATA:
            truthParams.push(req.body[paramName]);
            break;
          case ParamInEnum.QUERY:
            truthParams.push(req.query[paramName]);
            break;
          case ParamInEnum.HEADER:
            truthParams.push(req.headers[paramName]);
            break;
          case ParamInEnum.PATH:
          // 待处理
            truthParams.push(req.params[paramName]);
            break;
          case ParamInEnum.FILE:
            truthParams.push((req.files as ControllerFile[] | undefined)?.find((item) => item.fieldname === paramName));
            break;
          default:
            truthParams.push(undefined);
            break;
        }
      } else {
      // 非参数
        switch (controllerRouter.paramNames[i]) {
          case 'req':
          case 'request':
          case 'controllerRequest':
            truthParams.push(req);
            break;
          case 'res':
          case 'response':
          case 'controllerResponse':
            truthParams.push(res);
            break;
          case 'next':
          case 'controllerNext':
            truthParams.push(next);
            break;
          default:
            truthParams.push(undefined);
            break;
        }
      }
    }

    return async() => {
      if (!this.#paramsValidate(truthParams, controllerRouter, params)) {
        next(createError(400));
        return null;
      }
      let result = controllerRouter.fn.apply(controllerBean.controller, truthParams);

      if (result && result instanceof Promise) {
        result = await result;
      }

      return result;
    };
  }


  public static getInterceptorCb(
    req: Request,
    res: Response,
    next: NextFunction,
    interceptorBean: InterceptorBean,
    interceptorRouter: InterceptorRouter,
  ): Function {
    const truthParams: any[] = [];
    for (let i = 0; i < interceptorRouter.paramNames.length; i++) {
      // 非参数
      switch (interceptorRouter.paramNames[i]) {
        case 'req':
        case 'request':
        case 'controllerRequest':
          truthParams.push(req);
          break;
        case 'res':
        case 'response':
        case 'controllerResponse':
          truthParams.push(res);
          break;
        case 'next':
        case 'controllerNext':
          truthParams.push(next);
          break;
        default:
          truthParams.push(undefined);
          break;
      }
    }

    return async() => {
      let result = interceptorRouter.fn.apply(interceptorBean.interceptor, truthParams);

      if (result && result instanceof Promise) {
        result = await result;
      }

      return result;
    };
  }

}

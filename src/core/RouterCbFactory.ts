import { MetaKeyEnum, ParamInEnum, ParamTypeEnum, ResultTypeEnum } from '@enum';
import {
  ControllerBean,
  ControllerFile,
  ControllerParameter,
  ControllerRouter,
  InterceptorBean,
  InterceptorRouter,
  ControllerResult,
} from '@interface';
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { is } from 'brisk-ts-extends/is';

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

  static #innerValidate(type: string, value: any): any {
    switch (type) {
      case ParamTypeEnum.String:
        if (typeof value !== ParamTypeEnum.String) {
          return undefined;
        }
        break;
      case ParamTypeEnum.Boolean:
        if (!/^(?:true|false)$/u.test(value.toString())) {
          return undefined;
        }
        if (typeof value === ParamTypeEnum.String) {
          return this.#transformType(value, ParamTypeEnum.Boolean);
        }
        break;
      case ParamTypeEnum.Integer:
        if (!/^\d+$/u.test(value.toString())) {
          return undefined;
        }
        if (typeof value === ParamTypeEnum.String) {
          return this.#transformType(value, ParamTypeEnum.Integer);
        }
        break;
      case ParamTypeEnum.Number:
        if (Number.isNaN(Number(value.toString()))) {
          return undefined;
        }
        if (typeof value === ParamTypeEnum.String) {
          return this.#transformType(value, ParamTypeEnum.Number);
        }
        break;
      case ParamTypeEnum.Array:
        if (!Array.isArray(value) && !/^[^,]+,(?:[^,]+,*)+$/u.test(value.toString())) {
          return undefined;
        }
        if (typeof value === ParamTypeEnum.String) {
          return this.#transformType(value, ParamTypeEnum.Array);
        }
        break;
      // no default
    }
    // 默认不修改值
    return value;
  }

  static #paramsValidate(truthParams: any[], controllerRouter: ControllerRouter, params?: ControllerParameter[]): boolean | ControllerResult {
    for (let i = 0; i < controllerRouter.paramTypes.length; i++) {
      const param = params?.find((item) => item.paramIndex === i);
      // 自定义校验
      if (param?.option?.validate?.validate) {
        const allParam = params?.reduce((pre, current) => {
          pre[current.paramName] = truthParams[current.paramIndex];
          return pre;
        }, {} as any);
        const validateRes = param?.option?.validate?.validate(truthParams[i], allParam);
        if (validateRes) {
          return {
            type: ResultTypeEnum.JSON,
            statusCode: 400,
            content: validateRes,
          };
        }
        // 跳过其他校验
        continue;
      }


      // 空值判断
      if (truthParams[i] === undefined || truthParams[i] === null) {
        if (param?.option?.required) {
          return false;
        }
        // 非必选则跳过验证
        continue;
      }
      const type = controllerRouter.paramTypes[i].toLocaleLowerCase();
      const newValue = this.#innerValidate(type, truthParams[i]);
      if (newValue === undefined) {
        return false;
      }
      truthParams[i] = newValue;
    }
    return true;
  }

  static #getTruthParams(
    req: Request,
    res: Response,
    next: NextFunction,
    controllerRouter: ControllerRouter,
    params?: ControllerParameter[],
  ) {
    const truthParams: any[] = [];
    for (let i = 0; i < controllerRouter.paramNames.length; i++) {
      const param = params?.find((item) => item.paramIndex === i);
      if (param) {
        const paramName = param.option?.name || param.paramName;
        switch (param.in) {
          case ParamInEnum.BODY:
            truthParams.push(req.body);
            break;
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
    return truthParams;
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

    const truthParams = this.#getTruthParams(req, res, next, controllerRouter, params);

    return async() => {
      const validateRes = this.#paramsValidate(truthParams, controllerRouter, params);
      if (!validateRes) {
        next(createError(400));
        return null;
      }
      if (is<ControllerResult>(validateRes, 'ControllerResult')) {
        return validateRes;
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

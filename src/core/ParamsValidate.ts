import express from 'express';
import { ParamTypeEnum, RuleCollection, RuleObject } from '../interface/option/IRequestMappingOption';
import createError from 'http-errors';
import { pickBy as _pickBy } from 'lodash';
import { Key } from 'brisk-ioc';

function transformType(obj: any, key: Key, type: ParamTypeEnum) {
  switch (type) {
    case ParamTypeEnum.Boolean:
      obj[key] = Boolean(obj[key]);
      break;
    case ParamTypeEnum.Integer:
    case ParamTypeEnum.Number:
      obj[key] = Number(obj[key]);
      break;
    case ParamTypeEnum.Array:
      !Array.isArray(obj[key]) && (obj[key] = obj[key].split(','));
      break;
      // no default
  }
}

function paramsValidateType(required: boolean, value: any, type: ParamTypeEnum) {
  if (value === undefined || value === null) {
    return !required;
  }
  switch (type) {
    case ParamTypeEnum.String:
      return true;
    case ParamTypeEnum.Boolean:
      return /^(?:true|false)$/u.test(value);
    case ParamTypeEnum.Integer:
      return /^\d+$/u.test(value);
    case ParamTypeEnum.Number:
      return !Number.isNaN(Number(value));
    case ParamTypeEnum.Array:
      return Array.isArray(value) || (typeof value === 'string' && /^[^,]+,(?:[^,]+,*)+$/u.test(value));
    case ParamTypeEnum.File:
      return value === ParamTypeEnum.File;
    default:
      return false;
  }
}

/**
 *
 * @param req
 * @param params
 * @returns
 */
function paramsValidate(req: any, rules: RuleCollection): boolean {
  const fileds = _pickBy(rules.formData, (value) => {
    if (typeof value === 'string') {
      return value !== ParamTypeEnum.File;
    }
    return value.type !== ParamTypeEnum.File;
  });
  const file = _pickBy(rules.formData, (value) => {
    if (typeof value === 'string') {
      return value === ParamTypeEnum.File;
    }
    return value.type === ParamTypeEnum.File;
  });
  const reqParams: {[key:string]: RuleObject} = {
    headers: rules.header,
    query: rules.query,
    body: {
      ...rules.body,
      ...fileds,
    },
    files: file,
  };
  console.log(req.body);
  console.log(req.query);

  for (let [reqKey, paramsValue] of Object.entries(reqParams)) {
    for (let [key, desc] of Object.entries(paramsValue)) {
      if (
        (typeof desc === 'string'
            && !paramsValidateType(
              false,
              reqKey === 'files' ? ParamTypeEnum.File : req[reqKey]?.[key],
              desc,
            )
        )
          || (typeof desc !== 'string'
            && !paramsValidateType(
              desc.required,
              reqKey === 'files' ? ParamTypeEnum.File : req[reqKey]?.[key],
              desc.type,
            )
          )
      ) {
        return false;
      }
      // 验证成功，进行类型转换处理
      const type = typeof desc === 'string' ? desc : desc.type;
      transformType(req[reqKey], key, type);
    }
  }

  console.log(req.body);
  console.log(req.query);
  return true;
}


export function ParamsValidate(rules: RuleCollection, callback: express.RequestHandler): express.RequestHandler {
  return function(req, res, next) {
    // 参数校验
    if (!paramsValidate(req, rules)) {
      next(createError(400));
      return;
    }

    callback(req, res, next);
  };
}


import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import * as http from 'http';


export interface QueryStr{
  [key:string]: string | undefined;
}

/**
 * IControllerParams
 * @description 控制器参数接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月13日 13:27:02
 * @version 2.0.0
 */
export interface IControllerParams {
  req: Request;
  res: Response;
  next: NextFunction;
  // 动态路由参数path中
  params: ParamsDictionary;
  // post body参数
  body: any;
  query: QueryStr;
  cookies: any;
  originalUrl: string;
  headers: http.IncomingHttpHeaders;
}

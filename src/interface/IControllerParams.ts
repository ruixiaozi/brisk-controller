import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import * as http from 'http';

export interface FormDataFile {

  /** Name of the form field associated with this file. */
  fieldname: string;

  /** Name of the file on the uploader's computer. */
  originalname: string;

  /**
   * Value of the `Content-Transfer-Encoding` header for this file.
   * @deprecated since July 2015
   * @see RFC 7578, Section 4.7
   */
  encoding: string;

  /** Value of the `Content-Type` header for this file. */
  mimetype: string;

  /** Size of the file in bytes. */
  size: number;

  /** `MemoryStorage` only: A Buffer containing the entire file. */
  buffer: Buffer;
}

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
  // post form-data/x-www-form-urlencode/json中的字段（字符串）
  body: any;
   // post form-data中的文件
  files: FormDataFile[],
  // 查询字符串
  query: QueryStr;
  cookies: any;
  originalUrl: string;
  headers: http.IncomingHttpHeaders;
}

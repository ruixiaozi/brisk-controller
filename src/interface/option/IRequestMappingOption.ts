import { IOption } from "brisk-ioc";

export enum Method {
  All,
  POST,
  GET,
  PUT,
  DELETE,
}

export interface IRequestMappingOption extends IOption {
  path: string;
  method: Method;
}

import { IOption } from "brisk-ioc";


export enum Method{
  All,
  POST,
  GET,
  PUT,
  DELETE
}

export class RequestMappingOption implements IOption{

  constructor(public path: string, public method: Method = Method.All){}
}

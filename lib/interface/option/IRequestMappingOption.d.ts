import { IOption } from "brisk-ioc";
export declare enum Method {
    All = 0,
    POST = 1,
    GET = 2,
    PUT = 3,
    DELETE = 4
}
export interface IRequestMappingOption extends IOption {
    path: string;
    method: Method;
}

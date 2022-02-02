import { IRequestMappingOption, Method } from "../../interface/option/IRequestMappingOption";
export declare class RequestMappingOption implements IRequestMappingOption {
    path: string;
    method: Method;
    constructor(path: string, method?: Method);
}

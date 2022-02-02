import { IRequestMappingOption, Method } from "../../interface/option/IRequestMappingOption";


export class RequestMappingOption implements IRequestMappingOption {
  constructor(public path: string, public method: Method = Method.All) {}
}

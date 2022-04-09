import { InterceptorOption } from '@interface//option/InterceptorOption';

export interface InterceptorBean {
  interceptor: any;
  // Interceptor的_proto_
  target: any;
  option: InterceptorOption;
}

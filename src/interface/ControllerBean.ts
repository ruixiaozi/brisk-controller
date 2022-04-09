import { ControllerOption } from '@interface/option/ControllerOption';

export interface ControllerBean {
  controller: any;
  // controller的_proto_
  target: any;
  option: ControllerOption;
}

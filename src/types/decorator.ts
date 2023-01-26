import { BriskControllerValidator, BRISK_CONTROLLER_METHOD_E } from './base';

export interface BriskControllerDecoratorOption {
  tag?: string;
}

export interface BriskControllerDecoratorRequest {
  title?: string;
  description?: string;
  // 默认为get
  method?: BRISK_CONTROLLER_METHOD_E;
}

export interface BriskControllerDecoratorInterceptor {
  // 默认为get
  method?: BRISK_CONTROLLER_METHOD_E;
}

export interface BriskControllerDecoratorParam {
  name?: string,
  description?: string;
  // 校验器
  validator?: BriskControllerValidator;
}

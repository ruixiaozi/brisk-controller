import { BriskControllerValidator, BRISK_CONTROLLER_METHOD_E } from './base';
import { BriskControllerSwaggerTag } from './swagger';

export interface BriskControllerDecoratorOption {
  // 当前控制器的标签，用于swagger分类，默认为类名作为tag的name
  tag?: BriskControllerSwaggerTag;
}

export interface BriskControllerDecoratorRequest {
  // 标题，用于swagger显示
  title?: string;
  // 描述，用于swagger显示
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

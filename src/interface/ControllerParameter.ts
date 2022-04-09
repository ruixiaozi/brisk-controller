import { ParameterOption } from '@interface/option/ParameterOption';
import { ParamInEnum } from '@enum';

export interface ControllerParameter {
  in: ParamInEnum;
  type: string;
  // 参数在方法中的序号
  paramIndex: number;
  paramName: string;
  option?: ParameterOption;
}

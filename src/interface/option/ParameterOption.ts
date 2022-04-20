import { ControllerValidate } from '@interface/ControllerValidate';
import { BriskOption } from 'brisk-ioc';

/**
 * ParameterOption
 * @description 参数选项
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年03月27日 19:11:48
 * @version 3.0.0
 */
export interface ParameterOption extends BriskOption{
  // 参数实际名称，默认为修饰的函数形参名
  name?: string;
  description?: string;
  // 默认为false，但是ParamInEnum.PATH必须为true
  required?: boolean;
  // 校验方法
  validate?: ControllerValidate;
}

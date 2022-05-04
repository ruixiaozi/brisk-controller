import { BriskOption } from 'brisk-ioc';

/**
 * ControllerOption
 * @description 控制器选项接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 */
export interface ControllerOption extends BriskOption {
  // 路径，默认值 /
  path: string;
  // 描述
  description?: string;
}

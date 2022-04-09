import { BriskOption } from 'brisk-ioc';

/**
 * ControllerOption
 * @description 控制器选项接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 22:26:17
 * @version 2.0.0
 */
export interface ControllerOption extends BriskOption {
  // 路径，默认值 /
  path: string;
  // 描述
  description?: string;
}

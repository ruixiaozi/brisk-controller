import { IOption } from "brisk-ioc";
/**
 * IControllerOption
 * @description 控制器选项接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 22:26:17
 * @version 2.0.0
 */
export interface IControllerOption extends IOption {
  path: string;
}

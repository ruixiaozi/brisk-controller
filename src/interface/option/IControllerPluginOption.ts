import { IOption } from "brisk-ioc";
/**
 * IControllerPluginOption
 * @description 插件选项接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 22:26:34
 * @version 2.0.0
 */
export interface IControllerPluginOption extends IOption {
  limit?: string;
  port: number;
  priority: number;
  cors: boolean;
}

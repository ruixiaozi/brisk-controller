import { IControllerPluginOption } from "../../interface/option/IControllerPluginOption";

/**
 * ControllerPluginOption
 * @description 插件选项
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月01日 21:55:34
 * @version 2.0.0
 */
export class ControllerPluginOption implements IControllerPluginOption {
  constructor(
    public cors: boolean = false,
    public port: number = 3000,
    public priority: number = 3000,
    public limit?: string
  ) {}
}

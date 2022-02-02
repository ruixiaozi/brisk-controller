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
  /**
   * 构造方法
   * @param cors 是否开启跨域，默认值false
   * @param port 端口，默认值3000
   * @param priority 初始化优先级3000
   * @param limit json限制大小，可选
   */
  constructor(
    public cors: boolean = false,
    public port: number = 3000,
    public priority: number = 3000,
    public limit?: string
  ) {}
}

import { IControllerPluginOption } from "../../interface/option/IControllerPluginOption";
/**
 * ControllerPluginOption
 * @description 插件选项
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月01日 21:55:34
 * @version 2.0.0
 */
export declare class ControllerPluginOption implements IControllerPluginOption {
    cors: boolean;
    port: number;
    priority: number;
    limit?: string | undefined;
    constructor(cors?: boolean, port?: number, priority?: number, limit?: string | undefined);
}

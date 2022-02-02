import { IOption } from "brisk-ioc";
/**
 * PluginOption
 * @description 插件选项
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月01日 21:55:34
 * @version 2.0.0
 */
export declare class PluginOption implements IOption {
    limit?: number | undefined;
    port: number;
    priority: number;
    cors: boolean;
    constructor(limit?: number | undefined, port?: number, priority?: number, cors?: boolean);
}

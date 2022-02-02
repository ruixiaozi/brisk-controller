"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerPluginOption = void 0;
/**
 * ControllerPluginOption
 * @description 插件选项
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月01日 21:55:34
 * @version 2.0.0
 */
class ControllerPluginOption {
    constructor(cors = false, port = 3000, priority = 3000, limit) {
        this.cors = cors;
        this.port = port;
        this.priority = priority;
        this.limit = limit;
    }
}
exports.ControllerPluginOption = ControllerPluginOption;

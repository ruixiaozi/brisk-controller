"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginOption = void 0;
/**
 * PluginOption
 * @description 插件选项
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月01日 21:55:34
 * @version 2.0.0
 */
class PluginOption {
    constructor(limit, port = 3000, priority = 3000, cors = false) {
        this.limit = limit;
        this.port = port;
        this.priority = priority;
        this.cors = cors;
    }
}
exports.PluginOption = PluginOption;

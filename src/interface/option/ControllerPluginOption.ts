import { BriskOption } from 'brisk-ioc';
import { SwaggerOption } from '@interface/option/SwaggerOption';

/**
 * ControllerPluginOption
 * @description 插件选项接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 */
export interface ControllerPluginOption extends BriskOption {
  // json限制大小，可选
  limit?: string;
  // 端口，默认值3000
  port: number;
  // 初始化优先级3000
  priority: number;
  // 是否开启跨域，默认值false
  cors: boolean;
  // 基础地址
  baseUrl: string;
  // 静态文件路径，可选
  staticPath?: string;
  // swagger配置，可选
  swagger?: SwaggerOption;
}

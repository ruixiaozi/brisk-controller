import { ResultTypeEnum } from '@enum';

/**
 * ControllerResult
 * @description 控制器返回结果接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 */
export interface ControllerResult{
  type: ResultTypeEnum;
  statusCode: number;
  content: any;
}

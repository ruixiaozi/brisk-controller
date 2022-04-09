import { ResultTypeEnum } from '@enum';

/**
 * ControllerResult
 * @description 控制器返回结果接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月13日 13:35:46
 * @version 2.0.0
 */
export interface ControllerResult{
  type: ResultTypeEnum;
  statusCode: number;
  content: any;
}

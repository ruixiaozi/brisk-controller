
export enum ControllerResultTypeEnum{
  JSON,
  REDIRECT,
  RENDER
}

/**
* IControllerResult
* @description 控制器返回结果接口
* @author ruixiaozi
* @email admin@ruixiaozi.com
* @date 2022年02月13日 13:35:46
* @version 2.0.0
*/
export interface IControllerResult{
  type: ControllerResultTypeEnum;
  statusCode: number;
  content: any;
}

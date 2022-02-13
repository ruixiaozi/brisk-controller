import { IControllerResult } from './../interface/IControllerResult';
import { ControllerResultTypeEnum } from "../interface/IControllerResult";

/**
 * ControllerResult
 * @description 控制器返回结果
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月13日 13:35:46
 * @version 2.0.0
 */
export class ControllerResult implements IControllerResult {
  constructor(
    public type: ControllerResultTypeEnum,
    public statusCode: number,
    public content: any
  ) {}
}

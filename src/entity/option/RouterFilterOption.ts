import { IRouterFilterOption } from "../../interface/option/IRouterFilterOption";

/**
* RouterFilterOption
* @description 路由过滤器选项
* @author ruixiaozi
* @email admin@ruixiaozi.com
* @date 2022年01月23日 23:17:15
* @version 2.0.0
*/
export class RouterFilterOption implements IRouterFilterOption{
  /**
   * 构造方法
   * @param path 路由路径，默认值'/*'
   */
  constructor(public path: string = '/*'){

  }
}

/**
 * ControllerBean
 * @description 控制器组件
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 10:17:49
 * @version 2.0.0
 */
export class ControllerBean {
  /**
   * 构造方法
   * @param controller 控制器对象
   * @param path 路径
   */
  constructor(public controller: any, public path: string) {}
}

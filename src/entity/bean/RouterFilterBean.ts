/**
 * RouterFilterBean
 * @description 拦截器组件
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年02月02日 22:31:10
 * @version 2.0.0
 */
export class RouterFilterBean {

  /**
   * 构造方法
   * @param routerFilter 拦截器对象
   * @param path 路径
   */
  constructor(public routerFilter: any, public path: string) {}

}

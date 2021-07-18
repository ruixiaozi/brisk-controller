class ControllerDecorator {

  static BriskDecorator = undefined;


  /**
   * 控制器 装饰器
   * @description 仅支持类
   * @param {Object} option 选项 {path?='/' 路由路径}
   * @returns
   */
  static Controller(option) {
    return function (target, key, descriptor) {
      //类装饰器
      if (!descriptor) {
        target.prototype.path = (option && option.path) ? option.path : '/';
        ControllerDecorator.BriskDecorator.Bean({
          prefix: "controller-"
        })(target);
        return;
      }

      //方法装饰器
      if (typeof descriptor.value == 'function') {
        ;

      }
      //属性装饰器
      else {
        ;
      }


      return descriptor;

    };
  }

  /**
   * 路由 装饰器
   * @description 仅支持静态方法
   * @param {Object} option 选项 {path 路由路径, method?=all 请求方法 }
   * @returns
   */
   static RequestMapping(option) {
    return function (target, key, descriptor) {
      //类装饰器
      if (!descriptor) {
        return;
      }

      //方法装饰器
      if (typeof descriptor.value == 'function') {
        descriptor.enumerable = true;
        if (option && option.path) {
          descriptor.value.path = option.path;
          descriptor.value.method = option.method;
        }

      }
      //属性装饰器
      else {
        ;
      }


      return descriptor;
    }
  }

   /**
   * 过滤器 装饰器
   * @description 仅支持类
   * @param {Object} option 选项 {path?='/*' 路由路径}
   * @returns
   */
  static RouteFilter(option) {
    return function (target, key, descriptor) {
       //类装饰器
       if (!descriptor) {
        target.prototype.path = (option && option.path) ? option.path : '/*';
        ControllerDecorator.BriskDecorator.Bean({
          prefix: "routerfilter-"
        })(target);
        return;
      }

      //方法装饰器
      if (typeof descriptor.value == 'function') {
        ;

      }
      //属性装饰器
      else {
        ;
      }


      return descriptor;

    };
  }
}

module.exports = exports = ControllerDecorator;

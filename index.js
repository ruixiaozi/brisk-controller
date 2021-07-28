var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const ControllerDecorator = require('./decorator/ControllerDecorator');


class BriskController{

  static app = undefined;

  static port = '3000';

  static priority = 3000;

  static Decorator = ControllerDecorator;

  static install(BriskIoC, option){
    BriskController.app = express();
    ControllerDecorator.BriskDecorator = BriskIoC.CoreDecorator;
    if(option){
      BriskController.port = option.port?option.port:BriskController.port;
      BriskController.priority = option.priority?option.priority:BriskController.priority;
      if(option.cors){
        console.log("use cors...");
        //console.log(cors);
        BriskController.app.use(cors({
          origin:[/.*/],  //指定接收的地址
          methods:['GET','PUT','POST'],  //指定接收的请求类型
          alloweHeaders:['Content-Type','Authorization'],  //指定header
          credentials:true,

        }));
      }

    }

    BriskController.app.use(logger('dev'));
    BriskController.app.use(express.json());
    BriskController.app.use(express.urlencoded({ extended: false }));
    BriskController.app.use(cookieParser());
    BriskController.app.use(express.static(path.join(__dirname, 'public')));

    BriskIoC.initList.push({
      fn: BriskController.scanController,
      priority: BriskController.priority
    })

    BriskIoC.$controller = BriskController;
  }

  static scanController(BriskIoC){
    console.log("scanController...");

    //添加前置拦截器
    Object.keys(BriskIoC.classes).filter(s=>s.indexOf("routerfilter-")>-1)
      .forEach(s=>{
        var routerfilter = BriskIoC.getBean(s);
        if(typeof routerfilter['before'] == "function"){
          let fn = routerfilter['before'];
          BriskController.app.all(fn.path, BriskController.#routerFactory(routerfilter,fn))
        }

      });

    //扫描并注册控制器
    Object.keys(BriskIoC.classes).filter(s=>s.indexOf("controller-")>-1)
      .forEach(s=>{

        //创建控制器
        var controller = BriskIoC.getBean(s);
        controller.router = express.Router();
        console.log("controller :"+controller.path);
        //添加路由
        var routers = Object.getOwnPropertyNames(BriskIoC.classes[s].prototype)
          .map(key=>{
            return controller[key];
          })
          .filter(fn=>typeof fn == 'function' && fn.path)
          .forEach(fn=>{
            if(fn.method == "get"){
              controller.router.get(fn.path,BriskController.#routerFactory(controller,fn));
              console.log("   router get:"+fn.path);
            }
            else if(fn.method == "post"){
              controller.router.post(fn.path,BriskController.#routerFactory(controller,fn));
              console.log("   router post:"+fn.path);
            }
            else{
              controller.router.all(fn.path,BriskController.#routerFactory(controller,fn));
              console.log("   router all:"+fn.path);
            }


          });

          BriskController.app.use(controller.path,controller.router);


      })
  }

  static #routerFactory(that,fn){

    return async function(req,res,next){

      let result = fn.call(that,{
        req,
        res,
        next,
        params:req.params, //动态路由参数path中
        body:req.body,  //post body参数
        query:req.query,
        cookies:req.cookies,
        originalUrl:req.originalUrl,
        headers:req.headers
      });

      if(result && result.constructor.name == "Promise"){
        result = await result;
      }

      console.log(result);

      if(result && result.type && result.content){

        switch(result.type){
          case "json":
            res.status(result.code?result.code:200);
            res.json(result.content);
            break;
          case "redirect":
            res.redirect(result.content);
            break;
          case "render":
            res.status(result.code?result.code:200);
            res.render(result.content);
        }
      }




    }
  }



  static start(){

    BriskController.app.use(function(req, res, next) {
      next(createError(404));
    });

    BriskController.app.use(function(err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.json(err);
    });
    BriskController.app.listen(BriskController.port);
    console.log("listen to " + BriskController.port);
    console.log("http://localhost:"+BriskController.port);

  }


}


module.exports = exports = BriskController;

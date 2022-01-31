import { IPlugin } from 'brisk-ioc';
import { Core } from 'brisk-ioc/lib/core/Core';
import express,{Express} from 'express';

export * from './decorator/ControllerDecorator';

export * from './entity/ControllerOption';
export * from './entity/RequestMappingOption';
export * from './entity/RouterFilterOption';


class _ControllerPlugin implements IPlugin{
  app?: Express ;

  install(core: Core, option: any): void {
    this.app = express();
    ControllerDecorator.BriskDecorator = BriskIoC.CoreDecorator;
    if(option){
      BriskController.port = option.port?option.port:BriskController.port;
      BriskController.priority = option.priority?option.priority:BriskController.priority;
      if(option.cors){
        console.log("use cors...");
        //如果传入了cors选项，则使用传入的
        if(typeof option.corsOption == 'object')
          BriskController.app.use(cors(option.corsOption));
        else
          //默认选项
          BriskController.app.use(cors({
            origin:[/.*/],  //指定接收的地址
            methods:['GET','PUT','POST'],  //指定接收的请求类型
            alloweHeaders:['Content-Type','Authorization'],  //指定header
            credentials:true,
          }));
      }

    }

    BriskController.app.use(logger('dev'));
    BriskController.app.use(express.json(option.limit?{limit: option.limit}:{}));
    BriskController.app.use(express.urlencoded({ extended: false }));
    BriskController.app.use(cookieParser());
    BriskController.app.use(express.static(path.join(__dirname, 'public')));

    BriskIoC.initList.push({
      fn: BriskController.scanController,
      priority: BriskController.priority
    })

    BriskIoC.$controller = BriskController;
  }

}


export const BriskController: IPlugin = {

  install(core: Core, option: any){

  }
};

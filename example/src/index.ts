import { BriskIoC } from 'brisk-ioc';
import { BriskController, ControllerPluginOption } from 'brisk-controller';
import { TestController, A1 } from './controller/TestController';
import * as path from 'path';
(async function() {
  const CONTROLLER_CONFIG: ControllerPluginOption = {
    cors: true,
    port: 3000,
    priority: 3000,
    baseUrl: '/',
    staticPath: path.join(__dirname, './public'),
    swagger: {
      enable: true,
      title: 'test',
      version: '1.0.1',
      description: '111',
      host: 'localhost:3000',

    }
  };
  await BriskIoC.use(BriskController, CONTROLLER_CONFIG)
    .core
    .configurate({
      isDebug: true,
    })
    .scanPackage(__dirname,"./controller")
    .initAsync();

    BriskController.start();


})();



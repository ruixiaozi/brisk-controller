import BriskIoC from 'brisk-ioc';
import BriskController from 'brisk-controller';
import path from 'path';

(async function() {;
  BriskIoC.configure({
    beanPathes: [path.join(__dirname, './controller')]
  });
  await BriskIoC.scanBean();
  const app = await BriskController.start(3001, {
    swagger: true,
  });
})();

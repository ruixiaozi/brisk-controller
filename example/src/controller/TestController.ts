import { Bean } from "brisk-ioc";
import { Controller, FromBody, MethodEnum, RequestMapping, FromQuery, FromHeader, ControllerRequest, ControllerResponse } from 'brisk-controller';

export class A1{

}

@Controller()
export class TestController{
  @RequestMapping({
    path: '/test',
    method: MethodEnum.POST
  })
  public getTest (
    @FromQuery({name: 'test1'}) test: number = 9,
    @FromHeader() tt: string = '1',
    @FromBody() t1: Array<string>=['ds'],
    req: ControllerRequest,
    res: ControllerResponse,
  ) {

    console.log(test);
    console.log(tt);
    console.log(t1);
    console.log(req.hostname);
    res.sendStatus(200);

  }
}

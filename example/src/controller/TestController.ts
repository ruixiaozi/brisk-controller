
import { Controller, InCookie, InHeader, InPath, InQuery, RequestMapping } from 'brisk-controller';

@Controller()
class TestController {

  test1Data = 'test1';

  @RequestMapping('/test1/:c/:d')
  test1(
    @InQuery() a: number,
    @InHeader({name: 'b'}) testb: string,
    @InPath({description: 'c param'}) c: string,
    @InPath() d: number,
    @InCookie() e?: boolean,
  ) {
    console.log(a);
    console.log(testb);
    console.log(c);
    console.log(d);
    console.log(e);
    return {
      msg: this.test1Data
    }
  }
}

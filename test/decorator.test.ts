import { distory, start } from '../src/core/core';
import request from 'supertest';
import { Body, Controller, InBody, InCookie, InFormData, InHeader, InPath, InQuery, Interceptor, RequestMapping, State } from '../src/decorator';
import { BriskControllerRequest, BRISK_CONTROLLER_METHOD_E } from '../src/types';

describe('decorator1', () => {

  test('RequestMapping Should generate route and swagger info When use get', async () => {

    @Controller()
    class TestDecorator1 {

      test1Data = 'test1';

      @RequestMapping('/test1/:c/:d')
      test1(
        @InQuery() a: number,
        @InHeader({name: 'b'}) testb: string,
        @InPath({description: 'c param'}) c: string,
        @InPath() d: number,
        @InCookie() e?: boolean,
      ) {
        expect(a).toBe(1);
        expect(testb).toBe('testb');
        expect(c).toBe('test');
        expect(d).toBe(12);
        expect(e).toBe(true);
        return {
          msg: this.test1Data
        }
      }
    }

    const app = await start(3001, {
      swagger: true,
    });
    const res1 = await (request(app.callback()).get('/test1/test/12?a=1').set('b', 'testb').set('Cookie', 'e=true'));
    const res2 = await request(app.callback()).get('/swagger.json');
    await distory();
    expect(res1.status).toEqual(200);
    expect(res1.body).toEqual({ msg: 'test1' });
    expect(res2.status).toEqual(200);
    expect(res2.body.paths['/test1/{c}/{d}'].get.tags).toEqual(["TestDecorator1"]);
    expect(res2.body.paths['/test1/{c}/{d}'].get.parameters).toEqual([
      {
        "in": "query",
        "name": "a",
        "required": true,
        "schema": {
          "type": "number"
        }
      },
      {
        "in": "header",
        "name": "b",
        "required": true,
        "schema": {
          "type": "string"
        }
      },
      {
        "in": "path",
        "name": "c",
        "required": true,
        "schema": {
          "type": "string"
        },
        "description": "c param"
      },
      {
        "in": "path",
        "name": "d",
        "required": true,
        "schema": {
          "type": "number"
        }
      },
      {
        "in": "cookie",
        "name": "e",
        "required": false,
        "schema": {
          "type": "boolean"
        },
        "description": "\n<b>本页面无法发送cookie</b>"
      }
    ]);
  });

  test('RequestMapping Should generate route and swagger info When use post body', async () => {
    class TestParam2 {
      a!: string;
      b!: boolean;
      c?: number;
      d!: Array<string>;
    }

    @Controller('/test', {
      tag: { name: 'Test2' }
    })
    class TestDecorator2 {

      test2Data = 'test2';

      @RequestMapping('/test2', {
        method: BRISK_CONTROLLER_METHOD_E.POST,
        title: '测试2',
        description: '我是测试2'
      })
      test2(
        @Body() testParam2: TestParam2,
      ) {
        expect(testParam2).toEqual({
          a: '123',
          b: false,
          c: 1,
          d: ['123', '223']
        });
        return {
          msg: this.test2Data
        }
      }
    }

    const app = await start(3001, {
      swagger: true,
    });
    const res1 = await (request(app.callback()).post('/test/test2').send({
      a: '123',
      b: false,
      c: 1,
      d: ['123', '223']
    }));
    const res2 = await request(app.callback()).get('/swagger.json');
    await distory();
    expect(res1.status).toEqual(200);
    expect(res1.body).toEqual({ msg: 'test2' });
    expect(res2.status).toEqual(200);
    expect(res2.body.paths['/test/test2'].post.tags).toEqual(["Test2"]);
    expect(res2.body.paths['/test/test2'].post.summary).toEqual("测试2");
    expect(res2.body.paths['/test/test2'].post.description).toEqual("我是测试2");
    expect(res2.body.paths['/test/test2'].post.requestBody).toEqual({
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/TestParam2"
          }
        }
      }
    });
    expect(res2.body.components.schemas.TestParam2).toEqual({
      "type": "object",
      "properties": {
        "a": {
          "type": "string"
        },
        "b": {
          "type": "boolean"
        },
        "c": {
          "type": "number"
        },
        "d": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": [
        "a",
        "b",
        "d"
      ]
    });
  });

  test('RequestMapping Should generate route and swagger info When use put in body', async () => {

    @Controller()
    class TestDecorator3 {

      testData = 'test3';

      @RequestMapping('/test3', {
        method: BRISK_CONTROLLER_METHOD_E.PUT,
      })
      test3(
        @InBody() a: number,
        @InBody() b: string,
      ) {
        expect(a).toBe(1);
        expect(b).toBe('test3');
        return {
          msg: this.testData
        }
      }
    }

    const app = await start(3001, {
      swagger: true,
    });
    const res1 = await (request(app.callback()).put('/test3').send({
      a: 1,
      b: 'test3',
    }));
    const res2 = await request(app.callback()).get('/swagger.json');
    await distory();
    expect(res1.status).toEqual(200);
    expect(res1.body).toEqual({ msg: 'test3' });
    expect(res2.status).toEqual(200);
    expect(res2.body.paths['/test3'].put.tags).toEqual(["TestDecorator3"]);
    expect(res2.body.paths['/test3'].put.requestBody).toEqual({
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/SystemGenerateObject1"
          }
        }
      }
    });
    expect(res2.body.components.schemas.SystemGenerateObject1).toEqual({
      "type": "object",
      "properties": {
        "a": {
          "type": "number"
        },
        "b": {
          "type": "string"
        }
      },
      "required": [
        "a",
        "b"
      ]
    });
  });

  test('RequestMapping Should generate route and swagger info When use put in formdata', async () => {

    @Controller()
    class TestDecorator4 {

      testData = 'test4';

      @RequestMapping('/test4', {
        method: BRISK_CONTROLLER_METHOD_E.DELETE,
      })
      test4(
        @InFormData() a: number,
        @InFormData() b: string,
      ) {
        expect(a).toBe(1);
        expect(b).toBe('test4');
        return {
          msg: this.testData
        }
      }
    }

    const app = await start(3001, {
      swagger: true,
    });
    const res1 = await (request(app.callback()).delete('/test4').send('a=1&b=test4'));
    const res2 = await request(app.callback()).get('/swagger.json');
    await distory();
    expect(res1.status).toEqual(200);
    expect(res1.body).toEqual({ msg: 'test4' });
    expect(res2.status).toEqual(200);
    expect(res2.body.paths['/test4'].delete.tags).toEqual(["TestDecorator4"]);
    expect(res2.body.paths['/test4'].delete.requestBody).toEqual({
      "required": true,
      "content": {
        "application/x-www-form-urlencoded": {
          "schema": {
            "$ref": "#/components/schemas/SystemGenerateObject1"
          }
        }
      }
    });
    expect(res2.body.components.schemas.SystemGenerateObject1).toEqual({
      "type": "object",
      "properties": {
        "a": {
          "type": "number"
        },
        "b": {
          "type": "string"
        }
      },
      "required": [
        "a",
        "b"
      ]
    });
  });

  test('Interceptor Should generate interceptor When use decorator', async () => {

    @Controller()
    class TestDecorator5 {

      testData = 'test5';

      @Interceptor('/test5')
      test5Intercptor(req: BriskControllerRequest) {
        req.ctx.state.a = 2;
        return true;
      }

      @RequestMapping('/test5')
      test5(@State() a: number) {
        expect(a).toBe(2);
        return {
          msg: this.testData
        }
      }
    }

    const app = await start(3001, {
      swagger: true,
    });
    const res = await (request(app.callback()).get('/test5'));
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ msg: 'test5' });
  });
});

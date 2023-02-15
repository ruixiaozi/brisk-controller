import { addInterceptor, addRequest, distory, forward, redirect, start, throwError } from '../src/core/core';
import request from 'supertest';
import { BriskControllerRedirect, BRISK_CONTROLLER_METHOD_E, BRISK_CONTROLLER_PARAMETER_IS_E } from '../src/types';

describe('swagger', () => {

  test('get request Should generate get swagger When open swagger', async() => {
    addRequest('/test1', (a: number, b: boolean) => {
      return {
        msg: 'test1'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.QUERY,
          required: true,
          type: 'number',
        },
        {
          name: 'b',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.QUERY,
          required: true,
          type: 'boolean',
        },
      ],
      title: '测试1',
      description: '我是测试1',
    });
    const app = await start(3002, {
      swagger: true,
    });
    const res = await request(app.callback()).get('/swagger.json');
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body.paths['/test1'].get.tags).toEqual(["Default"]);
    expect(res.body.paths['/test1'].get.summary).toEqual('测试1');
    expect(res.body.paths['/test1'].get.description).toEqual('我是测试1');
    expect(res.body.paths['/test1'].get.parameters).toEqual([
      {
        "in": "query",
        "name": "a",
        "required": true,
        "schema": {
          "type": "number"
        }
      },
      {
        "in": "query",
        "name": "b",
        "required": true,
        "schema": {
          "type": "boolean"
        }
      }
    ]);
  });

  test('put request Should generate put swagger When open swagger', async() => {
    enum Test2Enum {
      CODE=1,
      TOKEN='token'
    }
    class Test1 {
      aa!: string;
    }
    class Test2 {
      a!: number;
      b!: string;
      c!: boolean;
      d!: string[];
      e!: Array<number>;
      f!: any;
      g!: Test1;
      h!: Test2Enum;
    }

    interface Test2Result {
      msg: string;
    }
    addRequest('/test2', (test2: Test2): Test2Result => {
      return {
        msg: 'test2'
      }
    }, {
      params: [
        {
          name: 'Test2',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.BODY,
          type: 'Test2',
        },
      ],
      tag: { name: 'test' },
      title: '测试2',
      description: '我是测试2',
      baseUrl: '/test',
      method: BRISK_CONTROLLER_METHOD_E.PUT,
      successResponseType: 'Test2Result',
    });
    const app = await start(3002, {
      swagger: true,
    });
    const res = await request(app.callback()).get('/swagger.json');
    await distory();
    console.log(JSON.stringify(res.body, undefined, 2));
    expect(res.status).toEqual(200);
    expect(res.body.paths['/test/test2'].put.tags).toEqual(["test"]);
    expect(res.body.paths['/test/test2'].put.summary).toEqual('测试2');
    expect(res.body.paths['/test/test2'].put.description).toEqual('我是测试2');
    expect(res.body.paths['/test/test2'].put.requestBody).toEqual({
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Test2"
          }
        }
      }
    });
    expect(res.body.paths['/test/test2'].put.responses).toEqual({
      "200": {
        "description": "OK",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/Test2Result"
            }
          }
        }
      }
    });
    expect(res.body.components.schemas.Test1.properties).toEqual({
      "aa": {
        "type": "string"
      },
    });
    expect(res.body.components.schemas.Test2Result.properties).toEqual({
      "msg": {
        "type": "string"
      },
    });
    expect(res.body.components.schemas.Test2Enum.type).toEqual('string');
    expect(res.body.components.schemas.Test2Enum.enum).toEqual([
      '1',
      'token',
    ]);
    expect(res.body.components.schemas.Test2.properties).toEqual({
      "a": {
        "type": "number"
      },
      "b": {
        "type": "string"
      },
      "c": {
        "type": "boolean"
      },
      "d": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "e": {
        "type": "array",
        "items": {
          "type": "number"
        }
      },
      "f": {},
      "g": {
        $ref: "#/components/schemas/Test1",
      },
      "h": {
        $ref: "#/components/schemas/Test2Enum",
      },
    });
  });

  test('redirect request Should generate 301 response swagger When open swagger', async() => {
    addRequest('/test3', (): BriskControllerRedirect => {
      return redirect('/mydirect')
    }, {
      tag: { name: 'test' },
      title: '测试3',
      description: '我是测试3',
      baseUrl: '/test',
      method: BRISK_CONTROLLER_METHOD_E.PUT,
      redirect: {
        urls: ['/mydirect'],
        status: 301
      }
    });
    const app = await start(3002, {
      swagger: true,
    });
    const res = await request(app.callback()).get('/swagger.json');
    await distory();
    console.log(JSON.stringify(res.body, undefined, 2));
    expect(res.status).toEqual(200);
    expect(res.body.paths['/test/test3'].put.tags).toEqual(["test"]);
    expect(res.body.paths['/test/test3'].put.summary).toEqual('测试3');
    expect(res.body.paths['/test/test3'].put.description).toEqual('我是测试3');
    expect(res.body.paths['/test/test3'].put.responses).toEqual({
      "301": {
        "description": 'redirect',
        "headers": {
          "Location": {
            "description": '["/mydirect"]',
            "schema": {
              "type": "string",
            }
          }
        }
      }
    });

  });

  test('request Should generate date-time format When has Date param', async() => {
    addRequest('/test4', (a: Date) => {
      return {
        msg: '123'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.QUERY,
          type: 'Date',
        },
      ],
      tag: { name: 'test' },
      title: '测试4',
      description: '我是测试4',
      baseUrl: '/test',
      method: BRISK_CONTROLLER_METHOD_E.PUT,
    });
    const app = await start(3002, {
      swagger: true,
    });
    const res = await request(app.callback()).get('/swagger.json');
    await distory();
    console.log(JSON.stringify(res.body, undefined, 2));
    expect(res.status).toEqual(200);
    expect(res.body.paths['/test/test4'].put.tags).toEqual(["test"]);
    expect(res.body.paths['/test/test4'].put.summary).toEqual('测试4');
    expect(res.body.paths['/test/test4'].put.description).toEqual('我是测试4');
    expect(res.body.paths['/test/test4'].put.parameters).toEqual([
      {
        "in": "query",
        "name": "a",
        "required": false,
        "schema": {
          "$ref": "#/components/schemas/Date"
        }
      }
    ]);
    expect(res.body.components.schemas.Date).toEqual({
      "type": "string",
      "format": "date-time"
    });
  });

});

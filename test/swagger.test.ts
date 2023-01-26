import { addInterceptor, addRequest, distory, forward, redirect, start, throwError } from '../src/core/core';
import request from 'supertest';
import { BRISK_CONTROLLER_METHOD_E, BRISK_CONTROLLER_PARAMETER_IS_E } from '../src/types';

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
    expect(res.body.paths['/test1'].get.tags).toEqual(["default"]);
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
    class Test2 {
      a!: number;
      b!: string;
      c!: boolean;
      d!: string[]; // 会识别为any，todo需要brisk-ts-extend优化
      e!: Array<number>; // 无法正确获取Array的泛型，todo需要brisk-ts-extend优化
      f!: any; // 非基本类型会自动转换为string类型
    }
    addRequest('/test2', (test2: Test2) => {
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
      tag: 'test',
      title: '测试2',
      description: '我是测试2',
      baseUrl: '/test',
      method: BRISK_CONTROLLER_METHOD_E.PUT
    });
    const app = await start(3002, {
      swagger: true,
    });
    const res = await request(app.callback()).get('/swagger.json');
    await distory();
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
        "type": "string"
      },
      "e": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "f": {
        "type": "string"
      }
    });
  });


});

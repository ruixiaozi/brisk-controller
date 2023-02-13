import { addInterceptor, addRequest, distory, forward, redirect, start, throwError } from '../src/core/core';
import request from 'supertest';
import { BRISK_CONTROLLER_METHOD_E, BRISK_CONTROLLER_PARAMETER_IS_E } from '../src/types';

describe('core', () => {

  test('test1 Should return msg info When use query string', async() => {
    addRequest('/test1', (a: number, b: boolean) => {
      expect(a).toBe(1);
      expect(b).toBe(true);
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
      ]
    });
    const app = await start();
    const res = await request(app.callback()).get('/test1?a=1&b=true');
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ msg: 'test1' });
  });

  test('test2 Should return msg info When use in body', async() => {
    addRequest('/test2', (a: boolean) => {
      expect(a).toBe(false);
      return {
        msg: 'test2'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.IN_BODY,
          required: true,
          type: 'boolean',
        },
      ],
      method: BRISK_CONTROLLER_METHOD_E.POST
    });
    const app = await start();
    const res = await (request(app.callback()).post('/test2').send({
      a: false
    }));
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ msg: 'test2' });

  });

  test('test3 Should return msg info When use in formdata', async() => {
    addRequest('/test3', (a: boolean) => {
      expect(a).toBe(false);
      return {
        msg: 'test3'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.FORM_DATA,
          required: true,
          type: 'boolean',
        },
      ],
      method: BRISK_CONTROLLER_METHOD_E.POST
    });
    const app = await start();
    const res = await (request(app.callback()).post('/test3').send('a=false'));
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ msg: 'test3' });
  });

  test('test4 Should return msg info When use path', async() => {
    addRequest('/test4/:a', (a: number) => {
      expect(a).toBe(1);
      return {
        msg: 'test4'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.PATH,
          required: true,
          type: 'number',
        },
      ],
      method: BRISK_CONTROLLER_METHOD_E.DELETE,
    });
    const app = await start();
    const res = await request(app.callback()).delete('/test4/1');
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ msg: 'test4' });
  });


  test('test5 Should return msg info When use header', async() => {
    addRequest('/test5', (a: number) => {
      expect(a).toBe(1);
      return {
        msg: 'test5'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.HEADER,
          required: true,
          type: 'number',
        },
      ]
    });
    const app = await start();
    const res = await (request(app.callback()).get('/test5').set('a', '1'));
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ msg: 'test5' });
  });

  test('test6 Should return msg info When use cookie', async() => {
    addRequest('/test6', (a: number) => {
      expect(a).toBe(1);
      return {
        msg: 'test6'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.COOKIE,
          required: true,
          type: 'number',
        },
      ]
    });
    const app = await start();
    const res = await (request(app.callback()).get('/test6').set('Cookie', ['a=1']));
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ msg: 'test6' });
  });

  test('test7 Should return 400 error When use query string but error type param', async() => {
    addRequest('/test7', (a: boolean) => {
      expect(a).toBe(false);
      return {
        msg: 'test7'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.QUERY,
          required: true,
          type: 'boolean',
        },
      ]
    });
    const app = await start();
    const res = await request(app.callback()).get('/test7?a=test');
    await distory();
    expect(res.status).toEqual(400);
    expect(res.text).toEqual('param \'a\' type error');
  });

  test('test8 Should return 400 error When use query string but param is not exist', async() => {
    addRequest('/test8', (a: number) => {
      expect(a).toBe(1);
      return {
        msg: 'test8'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.QUERY,
          required: true,
          type: 'number',
        },
      ]
    });
    const app = await start();
    const res = await request(app.callback()).get('/test8');
    await distory();
    expect(res.status).toEqual(400);
    expect(res.text).toEqual('param \'a\' required');
  });

  test('test9 Should return msg info When use body', async() => {
    class Test9 {
      a!: number;
    }
    addRequest('/test9', (test9: Test9) => {
      expect(test9?.a).toBe(1);
      return {
        msg: 'test9'
      }
    }, {
      params: [
        {
          name: 'Test9',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.BODY,
          type: 'Test9',
        },
      ],
      method: BRISK_CONTROLLER_METHOD_E.PUT
    });
    const app = await start();
    const res = await (request(app.callback()).put('/test9').send({
      a: 1,
    }));
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ msg: 'test9' });

  });

  test('test10 Should resolve custom When use interceptor', async() => {
    addInterceptor('/test10', (req, res) => {
      req.query.a = '1';
      return true;
    });
    addInterceptor('/test10', (req, res) => {
      req.query.a = '2';
      return true;
    });
    addRequest('/test10', (a: number) => {
      expect(a).toBe(2);
      return {
        msg: 'test10'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.QUERY,
          required: true,
          type: 'number',
        },
      ]
    });
    const app = await start();
    const res = await request(app.callback()).get('/test10');
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ msg: 'test10' });
  });

  test('test11 Should return 500 When throwError in interceptor', async() => {
    addInterceptor('/test11', (req, res) => {
      throwError(501, 'error');
    });
    addRequest('/test11', (a: number) => {
      return {
        msg: 'test11'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.QUERY,
          required: true,
          type: 'number',
        },
      ]
    });
    const app = await start();
    const res = await request(app.callback()).get('/test11');
    await distory();
    expect(res.status).toEqual(501);
    expect(res.text).toEqual('error');
  });

  test('test12 Should return redirect to target When use redirect', async() => {
    addRequest('/test12/2', () => {
      return redirect('/test12/1');
    });
    const app = await start();
    const res = await request(app.callback()).get('/test12/2');
    await distory();
    expect(res.status).toEqual(301);
    expect(res.text).toEqual('Redirecting to <a href="/test12/1">/test12/1</a>.');
  });

  test('test13 Should return target response When use forward', async() => {
    addRequest('/test13/1', () => {
      return {
        msg: 'test13'
      };
    });
    addRequest('/test13/2', () => {
      return forward('/test13/1');
    });
    const app = await start();
    const res = await request(app.callback()).get('/test13/2');
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ msg: 'test13' });
  });

  test('test14 Should get undefined value When use is NULL', async() => {
    addRequest('/test14', (a: number, b: boolean) => {
      expect(a).toBe(undefined);
      expect(b).toBe(true);
      return {
        msg: 'test14'
      }
    }, {
      params: [
        {
          name: 'a',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.NULL,
          type: 'undefined',
        },
        {
          name: 'b',
          is: BRISK_CONTROLLER_PARAMETER_IS_E.QUERY,
          required: true,
          type: 'boolean',
        },
      ]
    });
    const app = await start();
    const res = await request(app.callback()).get('/test14?b=true');
    await distory();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ msg: 'test14' });
  });
});

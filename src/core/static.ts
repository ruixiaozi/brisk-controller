import { Context, Next } from 'koa';
import send, { SendOptions } from 'koa-send';
import path from 'path';


export interface BriskControllerStaticOption extends SendOptions {
  prefix?: string;
}

export function staticMidWare(root: string, opts: BriskControllerStaticOption = {}) {
  opts.root = path.resolve(root);
  if (opts.index !== false) {
    opts.index = opts.index || 'index.html';
  };

  return async function midware(ctx: Context, next: Next) {
    // 先执行后续的路由
    await next();

    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
      return;
    };
    // 已经处理
    if ((ctx.body !== null && ctx.body !== undefined) || ctx.status !== 404) {
      return;
    };

    if (opts.prefix) {
      // 前缀不匹配
      if (!ctx.path.startsWith(opts.prefix)) {
        return;
      }
      ctx.path = ctx.path.slice(opts.prefix.length);
    }

    try {
      await send(ctx, ctx.path, opts);
    } catch (err: any) {
      if (err.status !== 404) {
        throw err;
      }
    }
  };
}

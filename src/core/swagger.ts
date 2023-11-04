import { BRISK_CONTROLLER_MIME_TYPE_E } from './../types/mimeType';
import { TypeKind } from 'brisk-ts-extends';
import { get, getParentTypeKind, getSubTypeKind } from 'brisk-ts-extends/runtime';
import {
  BriskControllerParameter,
  BriskControllerRequestOption,
  BriskControllerSwaggerConfig,
  BriskControllerSwaggerProperties,
  BriskControllerSwaggerRequestBody,
  BriskControllerSwaggerSchema,
  BriskControllerSwaggerTag,
  BRISK_CONTROLLER_FORMAT_E,
  BRISK_CONTROLLER_METHOD_E,
  BRISK_CONTROLLER_PARAMETER_IS_E,
  BRISK_CONTROLLER_PARAMTYPE_E,
} from '../types';
import path from 'path';
import { getLogger, LOGGER_LEVEL_E } from 'brisk-log';

// 保存运行时参数
const globalVal: {
  _briskSwaggerGenIndex?: number,
  // 路径、方法名、类型、处理器列表（按顺序执行）
  _briskSwaggerConfig?: BriskControllerSwaggerConfig,
  [key: string | symbol | number]: any,
} = globalThis;

if (!globalVal._briskSwaggerGenIndex) {
  globalVal._briskSwaggerGenIndex = 1;
}

if (!globalVal._briskSwaggerConfig) {
  globalVal._briskSwaggerConfig = {
    openapi: '3.0.1',
    info: {
      description: '',
      version: '1.0.0',
      title: '',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    tags: [],
    paths: {

    },
    components: {
      schemas: {

      },
    },
  };
}


const defaultTag: BriskControllerSwaggerTag = {
  name: 'Default',
  description: '默认',
};

const defaultRegion = Symbol('briskControllerSwagger');
const logger = getLogger(defaultRegion);
logger.configure({
  // 默认是info级别，可通过配置全局来改变此等级
  level: LOGGER_LEVEL_E.info,
});

export function reInitSwaggerConfig() {
  globalVal._briskSwaggerGenIndex = 1;
  globalVal._briskSwaggerConfig = {
    openapi: '3.0.1',
    info: {
      description: '',
      version: '1.0.0',
      title: '',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    tags: [],
    paths: {

    },
    components: {
      schemas: {

      },
    },
  };
}


export function addSwaggerSchema(name: string, schema: BriskControllerSwaggerSchema) {
  globalVal._briskSwaggerConfig!.components.schemas[name] = schema;
}

export function addSwaggerTag(tag: BriskControllerSwaggerTag = defaultTag) {
  if (!globalVal._briskSwaggerConfig!.tags.find((item) => item.name === tag.name)) {
    globalVal._briskSwaggerConfig!.tags.push(tag);
  }
}

function transforSwaggerType(type: TypeKind | TypeKind[]): string {
  const realType = Array.isArray(type) ? type[0] : type;
  switch (realType) {
    case 'string':
      return BRISK_CONTROLLER_PARAMTYPE_E.String;
    case 'number':
      return BRISK_CONTROLLER_PARAMTYPE_E.Number;
    case 'boolean':
      return BRISK_CONTROLLER_PARAMTYPE_E.Boolean;
    case 'BriskControllerFileArray':
    case 'BriskControllerFile':
      // 文件上传类型，已转换成字符串
      return BRISK_CONTROLLER_PARAMTYPE_E.String;
    default:
      if (getParentTypeKind(realType) === 'Array') {
        return BRISK_CONTROLLER_PARAMTYPE_E.Array;
      }
      if (getParentTypeKind(realType) === 'Promise') {
        return transforSwaggerType(getSubTypeKind(realType) as TypeKind);
      }

      // 默认返回类型本身
      return realType;
  }
}

// 转换引用类型，可直接通过已定义得类名，或者没有类名，通过参数列表转换
function transforSwaggerRef(type?: TypeKind, params?: BriskControllerParameter[]) {
  // 必须具有其中一个
  if (!type && !params) {
    return undefined;
  }
  const realType = type || `SystemGenerateObject${globalVal._briskSwaggerGenIndex!++}`;
  const typedes = get(realType);
  // 枚举和日期都是字符串
  const isString = typedes?.enums || realType === 'Date';
  if (typedes || isString) {
    addSwaggerSchema(realType, {
      type: isString ? BRISK_CONTROLLER_PARAMTYPE_E.String : BRISK_CONTROLLER_PARAMTYPE_E.Object,
      format: realType === 'Date' ? BRISK_CONTROLLER_FORMAT_E.DATETIME : undefined,
      properties: isString ? undefined : typedes?.properties.reduce((pre, current) => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        pre[current.key] = transforSwaggerSchema(current.type);
        return pre;
      }, {} as BriskControllerSwaggerProperties),
      enum: typedes?.enums,
      required: isString ? undefined : typedes?.properties.reduce((pre, current) => {
        if (!current.option) {
          pre.push(current.key);
        }
        return pre;
      }, [] as string[]),
    });
    return `#/components/schemas/${realType}`;
  } else if (params) {
    // 有参数列表，生成一个类型
    addSwaggerSchema(realType, {
      type: BRISK_CONTROLLER_PARAMTYPE_E.Object,
      properties: params.reduce((pre, current) => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        pre[current.name] = transforSwaggerSchema(current.type);
        return pre;
      }, {} as BriskControllerSwaggerProperties),
      required: params.reduce((pre, current) => {
        if (current.required) {
          pre.push(current.name);
        }
        return pre;
      }, [] as string[]),
    });
    return `#/components/schemas/${realType}`;
  }
  return undefined;
}

function transforSwaggerSchema(typeKind: TypeKind | TypeKind[]): BriskControllerSwaggerSchema {
  const paramType = transforSwaggerType(typeKind);
  return {
    type: [
      BRISK_CONTROLLER_PARAMTYPE_E.String,
      BRISK_CONTROLLER_PARAMTYPE_E.Number,
      BRISK_CONTROLLER_PARAMTYPE_E.Boolean,
      BRISK_CONTROLLER_PARAMTYPE_E.Array,
    ].includes(paramType as BRISK_CONTROLLER_PARAMTYPE_E) ? paramType as BRISK_CONTROLLER_PARAMTYPE_E : undefined,
    $ref: [
      BRISK_CONTROLLER_PARAMTYPE_E.String,
      BRISK_CONTROLLER_PARAMTYPE_E.Number,
      BRISK_CONTROLLER_PARAMTYPE_E.Boolean,
      BRISK_CONTROLLER_PARAMTYPE_E.Array,
    ].includes(paramType as BRISK_CONTROLLER_PARAMTYPE_E) ? undefined : transforSwaggerRef(paramType),
    items: paramType === BRISK_CONTROLLER_PARAMTYPE_E.Array
      ? transforSwaggerSchema(getSubTypeKind(Array.isArray(typeKind) ? typeKind[0] : typeKind) as TypeKind)
      : undefined,
    format: ['BriskControllerFile', 'BriskControllerFileArray'].includes((Array.isArray(typeKind) ? typeKind[0] : typeKind))
      ? BRISK_CONTROLLER_FORMAT_E.BINARY
      : undefined,
  };
}

function transforSwaggerReqBody(params?: BriskControllerParameter[]): BriskControllerSwaggerRequestBody | undefined {
  const bodyParam = params?.find((item) => item.is === BRISK_CONTROLLER_PARAMETER_IS_E.BODY);
  if (bodyParam?.type) {
    return {
      description: bodyParam.description,
      required: true,
      content: {
        [BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_JSON]: {
          schema: transforSwaggerSchema(bodyParam.type),
        },
      },
    };
  }
  const inBodyParams = params?.filter((item) => item.is === BRISK_CONTROLLER_PARAMETER_IS_E.IN_BODY);
  if (inBodyParams?.length) {
    return {
      required: true,
      content: {
        [BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_JSON]: {
          schema: {
            $ref: transforSwaggerRef(undefined, inBodyParams),
          },
        },
      },
    };
  }

  const inFormDataParams = params?.filter((item) => item.is === BRISK_CONTROLLER_PARAMETER_IS_E.FORM_DATA);
  if (inFormDataParams?.length) {
    return {
      required: true,
      content: {
        [BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_X_WWW_FORM_URLENCODED]: {
          schema: {
            $ref: transforSwaggerRef(undefined, inFormDataParams),
          },
        },
      },
    };
  }

  const fileParams = params?.filter((item) => item.is === BRISK_CONTROLLER_PARAMETER_IS_E.FILE);
  if (fileParams?.length) {
    return {
      required: true,
      content: {
        [BRISK_CONTROLLER_MIME_TYPE_E.MULTIPART_FORM_DATA]: {
          schema: {
            $ref: transforSwaggerRef(undefined, fileParams),
          },
        },
      },
    };
  }

  return undefined;
}

export function addSwaggerRoute(routePath: string, option?: BriskControllerRequestOption) {
  const transRoutePath = routePath
    .replace(/:(?<path>[a-zA-Z0-9]+)/ug, '{$1}')
    // 去除特殊匹配组
    .replace(/\(.+\)/ug, '')
    // 去除多余的内容
    .replace(/[^{}a-zA-Z0-9_\-./]+/ug, '');
  if (!globalVal._briskSwaggerConfig!.paths[transRoutePath]) {
    globalVal._briskSwaggerConfig!.paths[transRoutePath] = {};
  }

  const methods = Array.isArray(option?.method) ? option!.method : [option?.method || BRISK_CONTROLLER_METHOD_E.GET];
  methods.forEach((method) => {
    const tagName = option?.tag?.name || defaultTag.name;
    globalVal._briskSwaggerConfig!.paths[transRoutePath][method] = {
      // operationId应该保障全局唯一
      operationId: (option?.name || Math.floor(Math.random() * 10000).toFixed(16)) + tagName,
      tags: [tagName],
      summary: option?.title,
      description: option?.description,
      parameters: option?.params
        ?.filter((item) => [
          BRISK_CONTROLLER_PARAMETER_IS_E.PATH,
          BRISK_CONTROLLER_PARAMETER_IS_E.QUERY,
          BRISK_CONTROLLER_PARAMETER_IS_E.HEADER,
          BRISK_CONTROLLER_PARAMETER_IS_E.COOKIE,
        ].includes(item.is))
        .map((item) => ({
          in: item.is,
          name: item.name,
          required: Boolean(item.required),
          schema: item.type ? transforSwaggerSchema(item.type) : undefined,
          description: item.is === BRISK_CONTROLLER_PARAMETER_IS_E.COOKIE ? `${item?.description || ''}\n<b>本页面无法发送cookie</b>` : item?.description,
        })),
      requestBody: transforSwaggerReqBody(option?.params),
      responses: option?.redirect
        ? {
          [`${option.redirect.status || 301}`]: {
            description: 'redirect',
            headers: {
              Location: {
                description: `${JSON.stringify(option.redirect.urls)}`,
                schema: { type: BRISK_CONTROLLER_PARAMTYPE_E.String },
              },
            },
          },
        }
        : {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: option?.successResponseType ? transforSwaggerSchema(option.successResponseType) : {},
              },
            },
          },
        },
    };
  });
}

const packageInfo = require(path.join(process.cwd(), 'package.json'));

export function getSwaggerHandler(port: number, basePath: string) {
  globalVal._briskSwaggerConfig!.servers[0].url = `http://localhost:${port}${path.posix.join('/', basePath)}`;
  globalVal._briskSwaggerConfig!.info.title = `${packageInfo?.name || '默认'} - API文档`;
  globalVal._briskSwaggerConfig!.info.version = packageInfo?.version || '1.0.0';
  globalVal._briskSwaggerConfig!.info.description = `<b>注意：仅开启swagger选项有效，建议上线前关闭该选项</b>\n\n${packageInfo.description}`;
  return () => globalVal._briskSwaggerConfig!;
}

export function getSwaggerConfig() {
  return globalVal._briskSwaggerConfig!;
}

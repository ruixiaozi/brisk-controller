import { BRISK_CONTROLLER_MIME_TYPE_E } from './../types/mimeType';
import { TypeKind } from 'brisk-ts-extends';
import { get } from 'brisk-ts-extends/runtime';
import {
  BriskControllerParameter,
  BriskControllerRequestOption,
  BriskControllerSwaggerConfig,
  BriskControllerSwaggerProperties,
  BriskControllerSwaggerRequestBody,
  BriskControllerSwaggerSchema,
  BriskControllerSwaggerTag,
  BRISK_CONTROLLER_METHOD_E,
  BRISK_CONTROLLER_PARAMETER_IS_E,
  BRISK_CONTROLLER_PARAMTYPE_E,
} from '../types';
import path from 'path';

let generateIndex = 1;

let swaggerConfig: BriskControllerSwaggerConfig;

const defaultTag: BriskControllerSwaggerTag = {
  name: 'default',
  description: '默认',
};

export function initSwaggerConfig() {
  generateIndex = 1;
  swaggerConfig = {
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

initSwaggerConfig();

export function addSwaggerSchema(name: string, schema: BriskControllerSwaggerSchema) {
  swaggerConfig.components.schemas[name] = schema;
}

export function addSwaggerTag(tag: BriskControllerSwaggerTag = defaultTag) {
  if (!swaggerConfig.tags.find((item) => item.name === tag.name)) {
    swaggerConfig.tags.push(tag);
  }
}

function transforSwaggerParamType(type: TypeKind) {
  switch (type) {
    case 'string':
      return BRISK_CONTROLLER_PARAMTYPE_E.String;
    case 'number':
      return BRISK_CONTROLLER_PARAMTYPE_E.Number;
    case 'boolean':
      return BRISK_CONTROLLER_PARAMTYPE_E.Boolean;
    case 'Array':
      return BRISK_CONTROLLER_PARAMTYPE_E.Array;
    default:
      return BRISK_CONTROLLER_PARAMTYPE_E.String;
  }
}

function transforSwaggerParamRef(type: TypeKind) {
  const typedes = get(type);
  if (typedes) {
    addSwaggerSchema(type, {
      properties: typedes.properties.reduce((pre, current) => {
        const paramType = transforSwaggerParamType(Array.isArray(current.type) ? current.type[0] : current.type);
        pre[current.key] = {
          type: paramType,
          items: paramType === BRISK_CONTROLLER_PARAMTYPE_E.Array ? { type: BRISK_CONTROLLER_PARAMTYPE_E.String } : undefined,
        };
        return pre;
      }, {} as BriskControllerSwaggerProperties),
    });
  }
  return `#/components/schemas/${type}`;
}

function transforSwaggerReqBody(params?: BriskControllerParameter[]): BriskControllerSwaggerRequestBody | undefined {
  const bodyParam = params?.find((item) => item.is === BRISK_CONTROLLER_PARAMETER_IS_E.BODY);
  if (bodyParam?.type) {
    return {
      description: bodyParam.description,
      required: true,
      content: {
        [BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_JSON]: {
          schema: {
            $ref: transforSwaggerParamRef(bodyParam.type),
          },
        },
      },
    };
  }
  const inBodyParams = params?.filter((item) => item.is === BRISK_CONTROLLER_PARAMETER_IS_E.IN_BODY);
  if (inBodyParams?.length) {
    const bodyTypeName = `SystemGenerateObject${generateIndex++}`;
    addSwaggerSchema(bodyTypeName, {
      properties: inBodyParams.reduce((pre, current) => {
        const paramType = transforSwaggerParamType(Array.isArray(current.type) ? current.type[0] : current.type);
        pre[current.name] = {
          type: paramType,
          items: paramType === BRISK_CONTROLLER_PARAMTYPE_E.Array ? { type: BRISK_CONTROLLER_PARAMTYPE_E.String } : undefined,
        };
        return pre;
      }, {} as BriskControllerSwaggerProperties),
    });
    return {
      required: true,
      content: {
        [BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_JSON]: {
          schema: {
            $ref: `#/components/schemas/${bodyTypeName}`,
          },
        },
      },
    };
  }

  const inFormDataParams = params?.filter((item) => item.is === BRISK_CONTROLLER_PARAMETER_IS_E.FORM_DATA);
  if (inFormDataParams?.length) {
    const bodyTypeName = `SystemGenerateObject${generateIndex++}`;
    addSwaggerSchema(bodyTypeName, {
      properties: inFormDataParams.reduce((pre, current) => {
        const paramType = transforSwaggerParamType(Array.isArray(current.type) ? current.type[0] : current.type);
        pre[current.name] = {
          type: paramType,
          items: paramType === BRISK_CONTROLLER_PARAMTYPE_E.Array ? { type: BRISK_CONTROLLER_PARAMTYPE_E.String } : undefined,
        };
        return pre;
      }, {} as BriskControllerSwaggerProperties),
    });
    return {
      required: true,
      content: {
        [BRISK_CONTROLLER_MIME_TYPE_E.APPLICATION_X_WWW_FORM_URLENCODED]: {
          schema: {
            $ref: `#/components/schemas/${bodyTypeName}`,
          },
        },
      },
    };
  }

  return undefined;
}

export function addSwaggerRoute(routePath: string, option?: BriskControllerRequestOption) {
  const transRoutePath = routePath.replaceAll(/:(?<path>[a-zA-Z0-9-_]+)/ug, '{$1}');
  if (!swaggerConfig.paths[transRoutePath]) {
    swaggerConfig.paths[transRoutePath] = {};
  }
  swaggerConfig.paths[transRoutePath][option?.method || BRISK_CONTROLLER_METHOD_E.GET] = {
    tags: [option?.tag?.name || defaultTag.name],
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
        schema: item.type ? {
          type: ['string', 'number', 'boolean'].includes(item.type) ? transforSwaggerParamType(item.type) : undefined,
          $ref: ['string', 'number', 'boolean'].includes(item.type) ? undefined : transforSwaggerParamRef(item.type),
        } : undefined,
        description: item.is === BRISK_CONTROLLER_PARAMETER_IS_E.COOKIE ? `${item?.description || ''}\n<b>本页面无法发送cookie</b>` : item?.description,
      })),
    requestBody: transforSwaggerReqBody(option?.params),
    responses: {
      '200': {
        description: 'OK',
      },
    },
  };
}

const packageInfo = require('../../package.json');

export function getSwaggerHandler(port: number, basePath: string) {
  swaggerConfig.servers[0].url = `http://localhost:${port}${path.posix.join('/', basePath)}`;
  swaggerConfig.info.title = `${packageInfo.name} - API文档`;
  swaggerConfig.info.version = packageInfo.version;
  swaggerConfig.info.description = `<b>注意：仅开启swagger选项有效，建议上线前关闭该选项</b>\n\n${packageInfo.description}`;
  return () => swaggerConfig;
}

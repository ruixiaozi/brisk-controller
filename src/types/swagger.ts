import { BRISK_CONTROLLER_PARAMETER_IS_E } from './base';

export interface BriskControllerSwaggerContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface BriskControllerSwaggerLicense {
  name: string;
  url?: string;
}

export interface BriskControllerSwaggerInfo {
  description?: string;
  version: string;
  title: string;
  contact?: BriskControllerSwaggerContact;
  license?: BriskControllerSwaggerLicense;
}

export interface BriskControllerSwaggerTag {
  name: string;
  description?: string;
}


export interface BriskControllerSwaggerProperties {
  [name: string]: BriskControllerSwaggerSchema;
}

export enum BRISK_CONTROLLER_PARAMTYPE_E {
  String = 'string',
  Number = 'number',
  Integer = 'integer',
  Boolean = 'boolean',
  Array = 'array',
  // formData
  File = 'file',
  Object = 'object',
}

export enum BRISK_CONTROLLER_FORMAT_E {
  INT32='int32',
  INT64='int64',
  FLOAT='float',
  DOUBLE='double',
  BYTE='byte',
  BINARY='binary',
  DATE='date',
  DATETIME='date-time',
  PASSWORD='password',
}

export interface BriskControllerSwaggerSchema {
  // $ref和type二选一
  $ref?: string;
  type?: BRISK_CONTROLLER_PARAMTYPE_E;
  format?: BRISK_CONTROLLER_FORMAT_E;
  title?: string;
  description?: string;
  default?: any;
  required?: string[];
  // BRISK_CONTROLLER_PARAMTYPE_E.ARRAY必须有
  items?: BriskControllerSwaggerSchema;
  properties?: BriskControllerSwaggerProperties;
  example?: any;
  enum?: string[];
}


export interface BriskControllerSwaggerParam {
  in: BRISK_CONTROLLER_PARAMETER_IS_E;
  name: string;
  schema?: BriskControllerSwaggerSchema;
  description?: string;
  deprecated?: boolean;
  // 默认false，但是BRISK_CONTROLLER_PARAM_IN_E.PATH必须为true
  required?: boolean;
  // either query or formData
  allowEmptyValue?: boolean;
}


export interface BriskControllerSwaggerHeaders {
  [headName: string]: BriskControllerSwaggerSchema;
}

export interface BriskControllerSwaggerResponseItem {
  description: string;
  content?: BriskControllerSwaggerContent;
  headers?: BriskControllerSwaggerHeaders;
}

export interface BriskControllerSwaggerResponse {
  [code: string]: BriskControllerSwaggerResponseItem;
}

export interface BriskControllerSwaggerContent {
  [key: string]: {
    schema: BriskControllerSwaggerSchema;
  }
}

export interface BriskControllerSwaggerRequestBody {
  description?: string;
  content: BriskControllerSwaggerContent;
  required?: boolean;
}


export interface BriskControllerSwaggerOperation {
  // 用于生成操作方法，这个id需要唯一切遵循编程命名规范
  operationId?: string;
  responses: BriskControllerSwaggerResponse;
  tags?: string[];
  summary?: string;
  description?: string;
  requestBody?: BriskControllerSwaggerRequestBody;
  deprecated?: boolean;
  parameters?: BriskControllerSwaggerParam[];
}

export interface BriskControllerSwaggerPathItem {
  [method: string]: BriskControllerSwaggerOperation;
}

export interface BriskControllerSwaggerPaths {
  // path写绝对路径，包含参数使用{}包裹
  [path: string]: BriskControllerSwaggerPathItem;
}

export type BriskControllerSwaggerComponents = {
  schemas: { [key: string]: BriskControllerSwaggerSchema };
};

export interface BriskControllerSwaggerVariable {
  default: string;
  enum?: string[];
  description?: string;
}

export interface BriskControllerSwaggerServers {
  url: string;
  description?: string;
  variables?: { [key: string]: BriskControllerSwaggerVariable }
}


export interface BriskControllerSwaggerConfig {
  // 版本
  openapi: string;
  info: BriskControllerSwaggerInfo;
  servers: BriskControllerSwaggerServers[];
  tags: BriskControllerSwaggerTag[];
  paths: BriskControllerSwaggerPaths;
  components: BriskControllerSwaggerComponents;
}

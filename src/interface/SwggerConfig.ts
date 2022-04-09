import {
  MimeTypeEnum,
  ParamInEnum,
  ParamTypeEnum,
  SchemeEnum,
  SecurityEnum,
  OauthFlowEnum,
} from '@enum';

export interface SwggerContact{
  name?: string;
  url?: string;
  email?: string;
}

export interface SwggerLicense{
  name: string;
  url?: string;
}

export interface SwggerInfo{
  description?: string;
  version: string;
  title: string;
  contact?: SwggerContact;
  license?: SwggerLicense;
}

export interface SwggerTag{
  name: string;
  description?: string;
}


export interface SwggerProperties{
  [name: string]: SwggerSchema;
}

export interface SwggerSchema{
  // 引用本稳定，#/definitions/名称
  $ref?: string;
  title?: string;
  description?: string;
  default?: any;
  required?: string[];
  type?: ParamTypeEnum;
  // ParamTypeEnum.ARRAY必须有
  items?: SwggerArrayItems;
  properties?: SwggerProperties;
  example?: any;
}

export interface SwggerArrayItems {
  type: ParamTypeEnum;
  // ParamTypeEnum.ARRAY必须有
  items?: SwggerArrayItems;
  default?: any;
}


export interface SwggerParam{
  in: ParamInEnum;
  name: string;
  description?: string;
  // 默认false，但是ParamInEnum.PATH必须为true
  required?: boolean;
  // 非ParamInEnum.BODY必须有
  type?: ParamTypeEnum;
  // ParamInEnum.BODY必须有
  schema?: SwggerSchema;
  // either query or formData
  allowEmptyValue?: boolean;
  // ParamTypeEnum.ARRAY必须有
  items?: SwggerArrayItems;
  default?: any;
}


export interface SwggerHeaderItem{
  type: ParamTypeEnum;
  description?: string;
  // ParamTypeEnum.ARRAY必须有
  items?: SwggerArrayItems;
  default?: any;
}

export interface SwggerHeaders{
  [headName: string]: SwggerHeaderItem;
}

export interface SwggerExamples {
  [mimeType: string]: any;
}

export interface SwggerResponseItem{
  description: string;
  schema?: SwggerSchema;
  headers?: SwggerHeaders;
  examples?: SwggerExamples;
}


export interface SwggerResponse {
  [code: string]: SwggerResponseItem;
}

export interface SwggerSecurity{
  [key: string]: string[];
}


export interface SwggerOperation{
  responses: SwggerResponse;
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  consumes?: MimeTypeEnum[];
  produces?: MimeTypeEnum[];
  parameters?: SwggerParam[];
  security?: SwggerSecurity[];
  deprecated?: boolean;
  schemes?: SchemeEnum[];
}


export interface SwggerPathItem{
  [method: string]: SwggerOperation;
}

export interface SwggerPaths{
  // path写绝对路径，包含参数使用{}包裹
  [path: string]: SwggerPathItem;
}

export interface SwggerDefinitions{
  [name: string]: SwggerSchema;
}

export interface SwggerSecurityDefinition{
  type: SecurityEnum;
  description?: string;
  // apiKey
  name?: string;
  // apiKey
  in?: ParamInEnum.QUERY | ParamInEnum.HEADER;
  // oauth2
  flow?: OauthFlowEnum;
  // oauth2 ("implicit", "accessCode")
  authorizationUrl?: string;
  // oauth2 ("password", "application", "accessCode")
  tokenUrl?: string;
  // oauth2
  scopes? : {[scope: string]: string};
}

export interface SwggerSecurityDefinitions{
  [key: string]: SwggerSecurityDefinition;
}

export interface SwggerConfig{
  // 版本
  swagger: string;
  info: SwggerInfo;
  host: string;
  basePath: string;
  schemes: SchemeEnum[];
  tags: SwggerTag[];
  paths: SwggerPaths;
  definitions: SwggerDefinitions;
  securityDefinitions: SwggerSecurityDefinitions;
}

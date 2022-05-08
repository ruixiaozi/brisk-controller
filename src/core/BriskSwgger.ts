import {
  SwaggerOption,
  SwggerConfig,
  SwggerOperation,
  SwggerSchema,
  SwggerTag,
} from '@interface';
import { cloneDeep as _cloneDeep } from 'lodash';
import { MethodEnum, SchemeEnum, ParamTypeEnum } from '@enum';

const SwggerTemplate: SwggerConfig = {
  swagger: '2.0',
  info: {
    description: 'BriskController-template',
    version: '1.0.0',
    title: 'BriskController-template',
    contact: {
      email: 'admin@ruixiaozi.com',
    },
  },
  host: 'localhost',
  basePath: '/',
  tags: [],
  schemes: [SchemeEnum.HTTP],
  paths: {

  },
  securityDefinitions: {

  },
  definitions: {

  },
};

export class BriskSwgger {

  static #instance: BriskSwgger;

  public static getInstance(): BriskSwgger {
    if (!BriskSwgger.#instance) {
      BriskSwgger.#instance = new BriskSwgger();
    }
    return BriskSwgger.#instance;
  }

  public static typeNamesToParamType(typeNames?: string[]): ParamTypeEnum {
    const typeName = typeNames?.find((item) => item !== 'undefined') || 'string';
    switch (typeName) {
      case 'string':
      case 'String':
        return ParamTypeEnum.String;
      case 'number':
      case 'number':
        return ParamTypeEnum.Number;
      case 'boolean':
      case 'Boolean':
        return ParamTypeEnum.Boolean;
      case 'Date':
        return ParamTypeEnum.Date;
      default:
        if (typeName.startsWith('Array')) {
          return ParamTypeEnum.Array;
        }
        return ParamTypeEnum.String;
    }
  }

  #swggerConfig: SwggerConfig;

  #swggerUrl: string = '/docs';

  constructor() {
    this.#swggerConfig = _cloneDeep(SwggerTemplate);
  }

  public configurate(option: SwaggerOption): BriskSwgger {
    if (option.configPath) {
      this.#swggerConfig = require(option.configPath);
      return this;
    }
    option.host && (this.#swggerConfig.host = option.host);
    option.title && (this.#swggerConfig.info.title = option.title);
    option.version && (this.#swggerConfig.info.version = option.version);
    option.description && (this.#swggerConfig.info.description = option.description);
    option.schemes && (this.#swggerConfig.schemes = option.schemes);
    option.url && (this.#swggerUrl = option.url);
    return this;
  }

  public getSwggerData() {
    return this.#swggerConfig;
  }

  public getSwggerUrl() {
    return this.#swggerUrl;
  }

  public putOperation(path: string, method: MethodEnum, pathItem: SwggerOperation) {
    if (!this.#swggerConfig.paths[path]) {
      this.#swggerConfig.paths[path] = {};
    }
    this.#swggerConfig.paths[path][method] = pathItem;
  }

  public putDefinitions(name: string, schema: SwggerSchema) {
    this.#swggerConfig.definitions[name] = schema;
  }

  public putTag(tag: SwggerTag) {
    this.#swggerConfig.tags.push(tag);
  }

}

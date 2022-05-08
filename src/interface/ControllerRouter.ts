import { Key, RuntimeAttribute } from 'brisk-ts-extends/types';
import { RequestMappingOption } from '@interface/option/RequestMappingOption';

export interface ControllerRouter {
  paramNames: string[];
  paramTypes: string[];
  fn: Function;
  key: Key;
  option: RequestMappingOption;
  params?: RuntimeAttribute[];
}

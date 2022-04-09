import { InterceptorMappingOption } from '@interface/option/InterceptorMappingOption';
import { Key } from 'brisk-ts-extends/types';

export interface InterceptorRouter {
  paramNames: string[];
  paramTypes: string[];
  fn: Function;
  key: Key;
  option: InterceptorMappingOption;
}

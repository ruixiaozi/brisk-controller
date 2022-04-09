import { SchemeEnum } from '@enum';

export interface SwaggerOption{
  enable: boolean;
  configPath?: string;
  // 默认/docs
  url?: string;
  title?: string;
  version?: string;
  description?: string;
  host?: string;
  schemes?: SchemeEnum[];
}

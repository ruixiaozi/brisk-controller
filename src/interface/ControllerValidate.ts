export interface ControllerValidate {
  validate: (value: string, allParam?: any) => any;
  description?: string;
}

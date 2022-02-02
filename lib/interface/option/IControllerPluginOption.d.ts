import { IOption } from "brisk-ioc";
export interface IControllerPluginOption extends IOption {
    limit?: string;
    port: number;
    priority: number;
    cors: boolean;
}

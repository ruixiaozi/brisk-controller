import { ControllerPluginOption } from "./entity/option/ControllerPluginOption";
import { IPlugin } from "brisk-ioc";
import { Core } from "brisk-ioc/lib/core/Core";
export * from "./core/ControllerCore";
export * from "./decorator/ControllerDecorator";
export * from "./entity/option/ControllerOption";
export * from "./entity/option/RequestMappingOption";
export * from "./entity/option/RouterFilterOption";
export * from "./entity/option/ControllerPluginOption";
export * from './interface/option/IControllerOption';
export * from './interface/option/IControllerPluginOption';
export * from './interface/option/IRequestMappingOption';
export * from './interface/option/IRouterFilterOption';
declare class _ControllerPlugin implements IPlugin {
    private controllerCore;
    install(core: Core, option: ControllerPluginOption): void;
    start(): void;
}
export declare const BriskController: _ControllerPlugin;

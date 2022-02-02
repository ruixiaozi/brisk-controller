"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BriskController = void 0;
const brisk_ioc_1 = require("brisk-ioc");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const ControllerCore_1 = require("./core/ControllerCore");
const http_errors_1 = __importDefault(require("http-errors"));
__exportStar(require("./core/ControllerCore"), exports);
__exportStar(require("./decorator/ControllerDecorator"), exports);
__exportStar(require("./entity/option/ControllerOption"), exports);
__exportStar(require("./entity/option/RequestMappingOption"), exports);
__exportStar(require("./entity/option/RouterFilterOption"), exports);
__exportStar(require("./entity/option/ControllerPluginOption"), exports);
__exportStar(require("./interface/option/IControllerOption"), exports);
__exportStar(require("./interface/option/IControllerPluginOption"), exports);
__exportStar(require("./interface/option/IRequestMappingOption"), exports);
__exportStar(require("./interface/option/IRouterFilterOption"), exports);
class _ControllerPlugin {
    constructor() {
        this.controllerCore = ControllerCore_1.ControllerCore.getInstance();
    }
    install(core, option) {
        this.controllerCore.app = (0, express_1.default)();
        this.controllerCore.core = core;
        this.controllerCore.port = option.port;
        this.controllerCore.priority = option.priority;
        if (option.cors) {
            console.log("use cors...");
            this.controllerCore.app.use((0, cors_1.default)({
                origin: [/.*/],
                methods: ["GET", "PUT", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true,
            }));
        }
        this.controllerCore.app.use((0, morgan_1.default)("dev"));
        this.controllerCore.app.use(express_1.default.json(option.limit ? { limit: option.limit } : {}));
        this.controllerCore.app.use(express_1.default.urlencoded({ extended: false }));
        this.controllerCore.app.use((0, cookie_parser_1.default)());
        this.controllerCore.app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
        core.initList.push(new brisk_ioc_1.InitFunc(this.controllerCore.scanController.bind(this.controllerCore), this.controllerCore.priority));
    }
    start() {
        if (!this.controllerCore.app) {
            console.log("do not install");
            return;
        }
        this.controllerCore.app.use((req, res, next) => {
            next((0, http_errors_1.default)(404));
        });
        this.controllerCore.app.use((err, req, res, next) => {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get("env") === "development" ? err : {};
            // render the error page
            res.status(err.status || 500);
            res.json(err);
        });
        this.controllerCore.app.listen(this.controllerCore.port);
        console.log("listen to " + this.controllerCore.port);
        console.log("http://localhost:" + this.controllerCore.port);
    }
}
exports.BriskController = new _ControllerPlugin();

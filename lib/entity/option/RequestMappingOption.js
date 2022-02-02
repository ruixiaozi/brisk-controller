"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestMappingOption = void 0;
const IRequestMappingOption_1 = require("../../interface/option/IRequestMappingOption");
class RequestMappingOption {
    constructor(path, method = IRequestMappingOption_1.Method.All) {
        this.path = path;
        this.method = method;
    }
}
exports.RequestMappingOption = RequestMappingOption;

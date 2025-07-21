"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(httpCode, structuredError, errMessage, errDetails) {
        super();
        this.httpCode = httpCode;
        this.structuredError = structuredError;
        this.errMessage = errMessage;
        this.errDetails = errDetails;
    }
    get json() {
        return {
            code: this.httpCode,
            structured: this.structuredError,
            message: this.errMessage,
            details: this.errDetails
        };
    }
}
exports.ApiError = ApiError;

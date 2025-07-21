"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
// Les numéros de d'erreur standard de HTTP
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["BadRequest"] = 400] = "BadRequest";
    ErrorCode[ErrorCode["Unauthorized"] = 401] = "Unauthorized";
    ErrorCode[ErrorCode["Forbidden"] = 403] = "Forbidden";
    ErrorCode[ErrorCode["NotFound"] = 404] = "NotFound";
    ErrorCode[ErrorCode["TooManyRequests"] = 429] = "TooManyRequests";
    ErrorCode[ErrorCode["InternalError"] = 500] = "InternalError";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));

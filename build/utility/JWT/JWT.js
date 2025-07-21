"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT = void 0;
const ApiError_1 = require("../error/ApiError");
const ErrorCode_1 = require("../error/ErrorCode");
const fs_1 = require("fs");
const jsonwebtoken_1 = require("jsonwebtoken");
const path_1 = require("path");
class JWT {
    constructor() {
        if (!JWT.PRIVATE_KEY) {
            JWT.PRIVATE_KEY = (0, fs_1.readFileSync)(process.env.PRIVATE_KEY_FILE || (0, path_1.join)('config', 'signing', 'signing.key'), 'ascii');
        }
        if (!JWT.PUBLIC_KEY) {
            JWT.PUBLIC_KEY = (0, fs_1.readFileSync)(process.env.PUBLIC_KEY_FILE || (0, path_1.join)('config', 'signing', 'signing.pub'), 'ascii');
        }
    }
    async create(payload, options) {
        return new Promise((resolve, reject) => {
            (0, jsonwebtoken_1.sign)(payload, JWT.PRIVATE_KEY, Object.assign(options, { algorithm: 'RS256' }), (err, encoded) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(encoded);
            });
        });
    }
    async decodeAndVerify(token, options) {
        return new Promise((resolve, reject) => {
            (0, jsonwebtoken_1.verify)(token, JWT.PUBLIC_KEY, Object.assign(options, {
                algorithms: ['RS256']
            }), (err, decoded) => {
                if (err) {
                    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
                        reject(new ApiError_1.ApiError(ErrorCode_1.ErrorCode.Unauthorized, 'token/expired', 'Token expired'));
                    }
                    else {
                        reject(new ApiError_1.ApiError(ErrorCode_1.ErrorCode.Unauthorized, 'token/invalid', 'Token invalid'));
                    }
                    return;
                }
                resolve(decoded);
            });
        });
    }
}
exports.JWT = JWT;

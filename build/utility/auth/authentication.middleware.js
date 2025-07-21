"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const ApiError_1 = require("../error/ApiError");
const ErrorCode_1 = require("../error/ErrorCode");
const JWT_1 = require("../../utility/JWT/JWT");
const JWTConstants_1 = require("../../utility/JWT/JWTConstants");
async function expressAuthentication(request, securityName, scopes) {
    if (securityName === 'jwt') {
        const authheader = request.headers.authorization || '';
        if (!authheader.startsWith('Bearer ')) {
            throw new ApiError_1.ApiError(ErrorCode_1.ErrorCode.Unauthorized, 'auth/missing-header', 'Missing authorization header with Bearer token');
        }
        const token = authheader.split('Bearer ')[1];
        const jwt = new JWT_1.JWT();
        let decoded = await jwt.decodeAndVerify(token, {
            issuer: JWTConstants_1.JWT_ISSUER,
            audience: JWTConstants_1.JWT_ACCESS_AUD,
        });
        return decoded;
    }
    return null;
}

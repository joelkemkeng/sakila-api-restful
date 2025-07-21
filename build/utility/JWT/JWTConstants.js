"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_RENEW_AUD = exports.JWT_ACCESS_AUD = exports.JWT_EMAIL_LINK_AUD = exports.JWT_ISSUER = void 0;
/**
 * Pour le champ 'issuer' de tous nos JWT
 */
exports.JWT_ISSUER = "api-auth";
/**
 * Pour le champe 'aud' selon le cas
 */
exports.JWT_EMAIL_LINK_AUD = "api-email-link";
exports.JWT_ACCESS_AUD = "api-access";
exports.JWT_RENEW_AUD = "api-renew";

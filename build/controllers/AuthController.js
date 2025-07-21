"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const ApiError_1 = require("../utility/error/ApiError");
const ErrorCode_1 = require("../utility/error/ErrorCode");
const ORM_1 = require("../utility/ORM/ORM");
const tsoa_1 = require("tsoa");
const Emailer_1 = require("../utility/email/Emailer");
const JWT_1 = require("../utility/JWT/JWT");
const JWTConstants_1 = require("../utility/JWT/JWTConstants");
let AuthController = class AuthController {
    async sendMagicLink(body) {
        // Vérifier si on a un utilisateur avec l'adresse email dans notre base
        const user = await ORM_1.ORM.Read({
            table: 'user',
            idKey: 'email',
            idValue: body.email,
            columns: ['userId', 'email']
        });
        // Create the new JWT
        const jwt = new JWT_1.JWT();
        const encoded = await jwt.create({
            userId: user.userId,
        }, {
            expiresIn: '30 minutes',
            audience: JWTConstants_1.JWT_EMAIL_LINK_AUD,
            issuer: JWTConstants_1.JWT_ISSUER
        });
        const emailer = new Emailer_1.Emailer();
        const link = (process.env.FRONT_URL || 'http://localhost:' + (process.env.PORT || 5050)) + '/auth/authorize?jwt=' + encodeURIComponent(encoded);
        await emailer.sendMagicLink(body.email, link, 'Mon service');
        return {
            ok: true
        };
    }
    async authorizeFromLink(jwt) {
        const helper = new JWT_1.JWT();
        const decoded = await helper.decodeAndVerify(jwt, {
            issuer: JWTConstants_1.JWT_ISSUER,
            audience: JWTConstants_1.JWT_EMAIL_LINK_AUD,
        });
        if (!decoded.userId) {
            throw new ApiError_1.ApiError(ErrorCode_1.ErrorCode.Unauthorized, 'auth/invalid-authorize-link-token', "userId was not found in the payload for token");
        }
        // Vérifier que l'utilisateur existe toujours
        const user = await ORM_1.ORM.Read({
            table: 'user',
            idKey: 'userId',
            idValue: decoded.userId,
            columns: ['userId']
        });
        let payload = {
            userId: user.userId
            /** @todo: Ajouter des rôle(s) ici ! */
        };
        const access = await helper.create(payload, {
            expiresIn: '12 hours',
            issuer: JWTConstants_1.JWT_ISSUER,
            audience: JWTConstants_1.JWT_ACCESS_AUD,
        });
        return {
            access: access,
            redirectTo: 'https://lien.vers.mon.front',
            message: 'Normalement ce endpoint va demander au navigateur de rediriger vers votre site ou ressource'
        };
    }
    async renewToken(body) {
        const helper = new JWT_1.JWT();
        const decoded = await helper.decodeAndVerify(body.refreshToken, {
            issuer: JWTConstants_1.JWT_ISSUER,
            audience: JWTConstants_1.JWT_RENEW_AUD,
        });
        if (!decoded.userId) {
            throw new ApiError_1.ApiError(ErrorCode_1.ErrorCode.Unauthorized, 'auth/invalid-refresh-token', "userId was not found in the payload for token");
        }
        const user = await ORM_1.ORM.Read({
            table: 'user',
            idKey: 'userId',
            idValue: decoded.userId,
            columns: ['userId']
        });
        let payload = {
            userId: user.userId
            /** @todo: Ajouter des rôle(s) ici ! */
        };
        const access = await helper.create(payload, {
            expiresIn: '12 hours',
            issuer: JWTConstants_1.JWT_ISSUER,
            audience: JWTConstants_1.JWT_ACCESS_AUD,
        });
        const newRefreshToken = await helper.create({
            userId: user.userId
        }, {
            expiresIn: '1 week',
            issuer: JWTConstants_1.JWT_ISSUER,
            audience: JWTConstants_1.JWT_RENEW_AUD,
        });
        return {
            access: access,
            refreshToken: newRefreshToken
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, tsoa_1.Post)("/login"),
    __param(0, (0, tsoa_1.Body)())
], AuthController.prototype, "sendMagicLink", null);
__decorate([
    (0, tsoa_1.Get)("/authorize"),
    __param(0, (0, tsoa_1.Query)())
], AuthController.prototype, "authorizeFromLink", null);
__decorate([
    (0, tsoa_1.Post)("/renew"),
    __param(0, (0, tsoa_1.Body)())
], AuthController.prototype, "renewToken", null);
exports.AuthController = AuthController = __decorate([
    (0, tsoa_1.Route)("/auth")
], AuthController);

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFileController = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const ApiError_1 = require("../utility/error/ApiError");
const ErrorCode_1 = require("../utility/error/ErrorCode");
const ORM_1 = require("../utility/ORM/ORM");
const multer_1 = __importDefault(require("multer"));
const tsoa_1 = require("tsoa");
const ObjectStorage_1 = require("../utility/storage/ObjectStorage");
const uuid_1 = require("uuid");
/**
 * Controller pour le téléchargement des fichiers concernant un utilisateur
 */
let UserFileController = class UserFileController {
    /**
     * Envoyer un fichier
     * @param userId Le ID de l'utilisateur
     */
    async uploadFile(userId, request) {
        if (!request.file) {
            throw new ApiError_1.ApiError(ErrorCode_1.ErrorCode.BadRequest, 'object/invalid-multipart', 'Missing file data in multi-part upload');
        }
        const filename = (request.file.filename || request.file.originalname || (0, uuid_1.v4)());
        const storageKey = `user/${userId}/${filename}`;
        await ObjectStorage_1.ObjectStorage.upload(request.file.buffer, storageKey, request.file.mimetype);
        const result = await ORM_1.ORM.Create({
            table: 'user_file',
            body: {
                userId,
                storageKey,
                filename,
                mimeType: request.file.mimetype
            }
        });
        return result;
    }
    /**
     * Récupérer une liste de fichiers d'un utilisateur
     */
    async showFiles(userId, page, limit) {
        return ORM_1.ORM.Index({
            table: 'user_file',
            columns: ['fileId', 'userId', 'storageKey', 'mimeType'],
            where: { userId },
            query: { page, limit }
        });
    }
    /**
     * Récupérer un fichier selon son ID. Le résultat est une série de messages (statut 200) contenant les contenus du fichier.
     */
    async downloadFile(fileId, request) {
        const response = request.res;
        if (!response) {
            throw new ApiError_1.ApiError(ErrorCode_1.ErrorCode.InternalError, 'object/invalid-response', "A response object was not available");
        }
        // D'abord, récupérer la ligne dans la table, afin de récupérer la clé du stockage objet
        const file = await ORM_1.ORM.Read({
            table: 'user_file',
            idKey: 'fileId',
            idValue: fileId,
            columns: ['fileId', 'storageKey', 'mimeType']
        });
        // Ensuite lancer et streamer la réponse
        await new Promise(async (resolve, reject) => {
            try {
                const stream = await ObjectStorage_1.ObjectStorage.download(file.storageKey);
                request.res.writeHead(200, {
                    'Content-Type': file.mimeType || 'application/octet-stream',
                    'Transfer-Encoding': 'chunked'
                });
                stream.on('data', (chunk) => { response.write(chunk); });
                stream.on('error', (err) => {
                    throw (err);
                });
                stream.on('end', () => {
                    response.end();
                    resolve();
                });
            }
            catch (err) {
                if (err instanceof client_s3_1.NoSuchKey) {
                    reject(new ApiError_1.ApiError(ErrorCode_1.ErrorCode.InternalError, 'object/key-not-found-in-storage', 'Key not found in storage', { key: file.storageKey }));
                }
                else {
                    reject(err);
                }
            }
        });
    }
};
exports.UserFileController = UserFileController;
__decorate([
    (0, tsoa_1.Put)(),
    (0, tsoa_1.Middlewares)((0, multer_1.default)().single("file")),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)())
], UserFileController.prototype, "uploadFile", null);
__decorate([
    (0, tsoa_1.Get)(),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)())
], UserFileController.prototype, "showFiles", null);
__decorate([
    (0, tsoa_1.Get)("{fileId}"),
    (0, tsoa_1.SuccessResponse)("200", "Chunked object stream") // Custom success response
    ,
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)())
], UserFileController.prototype, "downloadFile", null);
exports.UserFileController = UserFileController = __decorate([
    (0, tsoa_1.Route)("/user/{userId}/file")
], UserFileController);

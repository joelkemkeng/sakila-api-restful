"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStorage = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const ApiError_1 = require("../error/ApiError");
const ErrorCode_1 = require("../error/ErrorCode");
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "COLLEZ_VOTRE_ID_ICI";
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "COLLEZ_VOTRE_CLE_ICI";
const REGION = process.env.STORAGE_REGION || "fr-par";
const ENDPOINT = process.env.STORAGE_ENDPOINT || "https://s3.fr-par.scw.cloud";
const BUCKET = process.env.STORAGE_BUCKET || "object-storage-playground";
/**
 * Classe wrapper pour un service de stockage d'objet cloud. Cette classe utilise le protocole Amazon S3, mais
 * on pourrait le remplacer avec un autre service (exemple Firebase) si on veux.
 * @todo Pour l'instant on envoie et récupère des fichiers. Idéalement on complétera avec d'autre fonctions comme: lister les fichiers, récupérer juste le meta-data des fichiers, tester l'existence d'un fichier, etc.
 */
class ObjectStorage {
    static async upload(buffer, key, mimetype) {
        const bareBonesS3 = new client_s3_1.S3({
            region: REGION,
            endpoint: ENDPOINT
        });
        const uploadParams = {
            Bucket: BUCKET,
            ACL: "public-read",
            Key: key,
            Body: buffer,
            ContentType: mimetype
        };
        const result = await bareBonesS3.putObject(uploadParams);
        if (result.$metadata.httpStatusCode !== 200) {
            throw new ApiError_1.ApiError(ErrorCode_1.ErrorCode.InternalError, 'object-storage/invalid-multipart', "Error transmitting file to object storage", result);
        }
        return key;
    }
    static async download(key) {
        const bareBonesS3 = new client_s3_1.S3({
            region: REGION,
            endpoint: ENDPOINT
        });
        const downloadParams = {
            Bucket: BUCKET,
            Key: key
        };
        const result = await bareBonesS3.getObject(downloadParams);
        return result.Body;
    }
}
exports.ObjectStorage = ObjectStorage;

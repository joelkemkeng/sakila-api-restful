"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORM = void 0;
const ApiError_1 = require("../error/ApiError");
const ErrorCode_1 = require("../error/ErrorCode");
const DB_1 = require("./DB");
/**
 * Class qui fournit des fonctions utilitaires pour les opérations ICRUD.
 */
class ORM {
    /**
     * Ajoute une ligne dans la base de données
     * @param options
     * @returns ICreateResponse
     */
    static async Create(options) {
        const db = DB_1.DB.Connection;
        const data = await db.query(`insert into ${options.table} set ?`, options.body);
        return {
            id: data[0].insertId
        };
    }
    /**
     * Récupérer une page de lignes d'une table, en précisant les colonnes souhaitées
     */
    static async Index(options) {
        const db = DB_1.DB.Connection;
        // On suppose que le params query sont en format string, et potentiellement
        // non-numérique, ou corrompu
        const page = parseInt(options.query?.page || "0") || 0;
        const limit = parseInt(options.query?.limit || "10") || 0;
        const offset = page * limit;
        // D'abord, récupérer le nombre total
        let whereClause = '';
        let whereValues = [];
        if (options.where) {
            const whereList = [];
            Object.entries(options.where).forEach(([key, value]) => {
                whereList.push(key + ' = ?');
                whereValues.push(value);
            });
            whereClause = 'where  ' + whereList.join(' and ');
        }
        // console.log(mysql.format(`select count(*) as total from ${table} ${whereClause}`, whereValues))
        const count = await db.query(`select count(*) as total from ${options.table} ${whereClause}`, whereValues);
        // Récupérer les lignes
        const sqlBase = `select ${options.columns.join(',')} from ${options.table} ${whereClause} limit ? offset ?`;
        const data = await db.query(sqlBase, [...whereValues, limit, offset].filter(e => e !== undefined));
        // Construire la réponse
        const res = {
            page,
            limit,
            total: count[0][0].total,
            rows: data[0]
        };
        return res;
    }
    /**
     * Récupérer une ligne dans la base de données, étant donné son identifiant
     * @param options
     * @returns
     * @throws ApiError si aucune ligne n'est trouvée
     */
    static async Read(options) {
        const db = DB_1.DB.Connection;
        const data = await db.query(`select ${options.columns.join(',')} from ${options.table} where ${options.idKey} = ?`, [options.idValue]);
        if (data[0].length > 0) {
            return data[0][0];
        }
        else {
            throw new ApiError_1.ApiError(ErrorCode_1.ErrorCode.BadRequest, 'sql/not-found', `Could not read row with ${options.idKey} = ${options.idValue}`);
        }
    }
    static async Update(options) {
        const db = DB_1.DB.Connection;
        const data = await db.query(`update ${options.table} set ? where ${options.idKey} = ?`, [options.body, options.idValue]);
        return {
            id: options.idValue,
            rows: data[0].affectedRows
        };
    }
    static async Delete(options) {
        const db = DB_1.DB.Connection;
        const data = await db.query(`delete from ${options.table} where ${options.idKey} = ?`, [options.idValue]);
        return {
            id: options.idValue,
            rows: data[0].affectedRows
        };
    }
}
exports.ORM = ORM;

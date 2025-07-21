"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
/** Wrapper de la connexion à la SGBDR.
 * On stock une seule référence à la connexion-pool, et on va systématiquement
 * récupérer cette référence pour nos requêtes.
 */
class DB {
    /**
     * Récupérer ou créer la connexion-pool.
     */
    static get Connection() {
        if (!this.POOL) {
            this.POOL = promise_1.default.createPool({
                host: process.env.DB_HOST || 'dbms',
                user: process.env.DB_USER || 'root',
                database: process.env.DB_DATABASE || 'sakila',
                password: process.env.DB_PASSWORD || 'root',
            });
        }
        return this.POOL;
    }
    static async Close() {
        if (this.POOL) {
            await this.POOL.end();
            this.POOL = undefined;
        }
    }
}
exports.DB = DB;

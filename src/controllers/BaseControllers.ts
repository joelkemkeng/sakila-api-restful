import { DB } from "../utility/ORM/DB";
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { DbTable } from "../model/DbTable";
import { ApiError } from "../utility/error/ApiError";
import { ErrorCode } from "../utility/error/ErrorCode";

/**
 * Contrôleur de base pour les opérations CRUD génériques
 */
export class BaseController<T> {
  protected db = DB.Connection;
  protected table: DbTable;
  protected idField: string;

  /**
   * Constructeur du contrôleur de base
   * @param table Table de la base de données
   * @param idField Champ d'identifiant (par défaut 'id')
   */
  constructor(table: DbTable, idField: string = 'id') {
    this.table = table;
    this.idField = idField;
  }

  /**
   * Récupère tous les éléments avec pagination
   */
  async getAll(page: number = 1, pageSize: number = 10) {
    const offset = (page - 1) * pageSize;
    
    // Récupérer le nombre total d'éléments
    const [countResult] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM ${this.table}`
    );
    const total = countResult[0].total;
    
    // Récupérer les éléments avec pagination
    const [items] = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM ${this.table} LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    
    return {
      data: items as T[],
      total,
      page,
      pageSize
    };
  }

  /**
   * Récupère un élément par son identifiant
   */
  async getById(id: number | string): Promise<T | null> {
    const [items] = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM ${this.table} WHERE ${this.idField} = ?`,
      [id]
    );
    
    if (items.length === 0) {
      return null;
    }
    
    return items[0] as T;
  }

  /**
   * Crée un nouvel élément
   */
  async create(data: Partial<T>): Promise<T> {
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO ${this.table} SET ?`,
      [data]
    );
    
    const newItem = await this.getById(result.insertId);
    
    if (!newItem) {
      throw new ApiError(ErrorCode.InternalError, `${this.table}/creation-failed`, `Failed to create ${this.table}`);
    }
    
    return newItem;
  }

  /**
   * Met à jour un élément existant
   */
  async update(id: number | string, data: Partial<T>): Promise<T | null> {
    // Vérifier si l'élément existe
    const item = await this.getById(id);
    
    if (!item) {
      throw new ApiError(ErrorCode.NotFound, `${this.table}/not-found`, `${this.table} not found`);
    }
    
    // Mise à jour de l'élément
    await this.db.query(
      `UPDATE ${this.table} SET ? WHERE ${this.idField} = ?`,
      [data, id]
    );
    
    // Récupérer l'élément mis à jour
    return this.getById(id);
  }

  /**
   * Supprime un élément
   */
  async delete(id: number | string): Promise<boolean> {
    // Vérifier si l'élément existe
    const item = await this.getById(id);
    
    if (!item) {
      throw new ApiError(ErrorCode.NotFound, `${this.table}/not-found`, `${this.table} not found`);
    }
    
    // Suppression de l'élément
    const [result] = await this.db.query<ResultSetHeader>(
      `DELETE FROM ${this.table} WHERE ${this.idField} = ?`,
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

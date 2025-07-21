import { DB } from '../utility/ORM/DB';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { DbTable } from '../model/DbTable';
import { ApiError } from '../utility/error/ApiError';
import { ErrorCode } from '../utility/error/ErrorCode';
import { IPaginationOptions, IPaginationResult } from '../model/types/IPagination';

/**
 * Contrôleur de base pour les opérations CRUD
 * Cette classe implémente les méthodes CRUD standard avec MySQL2
 */
export class BaseController<T> {
  protected db = DB.Connection;
  protected table: DbTable;
  protected idField: string;

  constructor(table: DbTable, idField: string = 'id') {
    this.table = table;
    this.idField = idField;
  }

  /**
   * Récupérer tous les enregistrements avec pagination
   */
  async findAll(options: IPaginationOptions = {}): Promise<IPaginationResult<T>> {
    const { page = 1, pageSize = 10, sortBy = this.idField, sortOrder = 'ASC' } = options;
    const offset = (page - 1) * pageSize;
    
    // Récupérer le nombre total d'enregistrements
    const [countResult] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM ${this.table}`
    );
    const total = countResult[0].total;

    // Récupérer les données avec pagination et tri
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM ${this.table} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    return {
      data: rows as T[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * Récupérer un enregistrement par ID
   */
  async findById(id: number | string): Promise<T | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM ${this.table} WHERE ${this.idField} = ?`,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as T;
  }

  /**
   * Créer un nouvel enregistrement
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await this.db.query<ResultSetHeader>(
        `INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})`,
        values
      );

      const insertedId = result.insertId;
      
      // Récupérer l'enregistrement créé
      const newRecord = await this.findById(insertedId);
      
      if (!newRecord) {
        throw new ApiError(ErrorCode.InternalError, 'controller/create-failed', 'Failed to retrieve created record');
      }
      
      return newRecord;
    } catch (error) {
      console.error(`❌ Error creating record in ${this.table}:`, error);
      throw error;
    }
  }

  /**
   * Mettre à jour un enregistrement
   */
  async update(id: number | string, data: Partial<T>): Promise<T | null> {
    try {
      // Vérifier si l'enregistrement existe
      const existingRecord = await this.findById(id);
      
      if (!existingRecord) {
        return null;
      }

      // Préparer les parties SET de la requête
      const setValues = Object.keys(data)
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = [...Object.values(data), id];

      // Exécuter la mise à jour
      const [result] = await this.db.query<ResultSetHeader>(
        `UPDATE ${this.table} SET ${setValues} WHERE ${this.idField} = ?`,
        values
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      // Récupérer l'enregistrement mis à jour
      return this.findById(id);
    } catch (error) {
      console.error(`❌ Error updating record in ${this.table}:`, error);
      throw error;
    }
  }

  /**
   * Supprimer un enregistrement
   */
  async delete(id: number | string): Promise<boolean> {
    try {
      const [result] = await this.db.query<ResultSetHeader>(
        `DELETE FROM ${this.table} WHERE ${this.idField} = ?`,
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`❌ Error deleting record from ${this.table}:`, error);
      throw error;
    }
  }

  /**
   * Rechercher des enregistrements par critères
   */
  async findWhere(criteria: Partial<T>, options: IPaginationOptions = {}): Promise<IPaginationResult<T>> {
    const { page = 1, pageSize = 10, sortBy = this.idField, sortOrder = 'ASC' } = options;
    const offset = (page - 1) * pageSize;
    
    // Préparer les conditions WHERE
    const whereConditions = Object.keys(criteria)
      .map(key => `${key} = ?`)
      .join(' AND ');
    
    const whereClause = whereConditions ? `WHERE ${whereConditions}` : '';
    const values = Object.values(criteria);

    // Compter le nombre total d'enregistrements correspondants
    const [countResult] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM ${this.table} ${whereClause}`,
      values
    );
    const total = countResult[0].total;

    // Récupérer les données avec pagination
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM ${this.table} ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );

    return {
      data: rows as T[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
}

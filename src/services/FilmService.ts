import { Film } from '../model/types/Film';
import { database } from '../database';
import { storage } from '../utility/fileStorage';

export class FilmService {
  static async create(data: Partial<Film>, coverFile: Express.Multer.File) {
    const coverPath = `covers/${coverFile.filename}`;
    await storage.save(coverFile.path, coverPath);
    
    const [result] = await database.query(
      'INSERT INTO film SET ?',
      { ...data, cover_image: coverPath }
    );
    return this.getById(result.insertId);
  }

  static async getById(id: number) {
    const [rows] = await database.query('SELECT * FROM film WHERE film_id = ?', [id]);
    return rows[0];
  }

  static async update(id: number, data: Partial<Film>) {
    await database.query('UPDATE film SET ? WHERE film_id = ?', [data, id]);
    return this.getById(id);
  }

  static async delete(id: number) {
    await database.query('DELETE FROM film WHERE film_id = ?', [id]);
    return { success: true };
  }

  static async getActors(filmId: number) {
    const [rows] = await database.query(
      `SELECT actor.* FROM film_actor
      JOIN actor USING(actor_id)
      WHERE film_id = ?`, 
      [filmId]
    );
    return rows;
  }
}

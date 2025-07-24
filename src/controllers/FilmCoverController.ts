import { Post, Get, Delete, Route, Tags, Path, UploadedFile, Security } from 'tsoa';
import { DB } from '../utility/ORM/DB';
import { IFilmCover } from '../model/types/IFilmCover';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import * as fs from 'fs';
import * as path from 'path';
import { ApiError } from '../utility/error/ApiError';
import { ErrorCode } from '../utility/error/ErrorCode';

@Route('films')
@Tags('Film Covers')
export class FilmCoverController {
    private readonly UPLOAD_DIR = path.join(__dirname, '../../uploads/covers');

    constructor() {
        // Créer le dossier d'upload s'il n'existe pas
        if (!fs.existsSync(this.UPLOAD_DIR)) {
            fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
        }
    }

    /**
     * Télécharger une image de couverture pour un film
     */
    @Security('jwt', ['admin'])
    @Post('{filmId}/cover')
    public async uploadCover(
        @Path() filmId: number,
        @UploadedFile() file: Express.Multer.File
    ): Promise<IFilmCover> {
        const db = DB.Connection;

        // Vérifier si le film existe
        const [films] = await db.query<RowDataPacket[]>(
            'SELECT film_id FROM film WHERE film_id = ?',
            [filmId]
        );
        if (films.length === 0) {
            throw new ApiError(ErrorCode.NotFound, 'film/not-found', 'Film not found');
        }

        // Créer un nom de fichier unique
        const filename = `${filmId}_${Date.now()}${path.extname(file.originalname)}`;
        const filepath = path.join(this.UPLOAD_DIR, filename);

        // Sauvegarder le fichier
        fs.writeFileSync(filepath, file.buffer);

        // Enregistrer les métadonnées dans la base de données
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO film_covers (film_id, cover_path, file_type, file_size) VALUES (?, ?, ?, ?)',
            [filmId, filename, file.mimetype, file.size]
        );

        // Retourner les métadonnées du fichier
        return {
            id: result.insertId,
            film_id: filmId,
            cover_path: filename,
            file_type: file.mimetype,
            file_size: file.size,
            created_at: new Date()
        };
    }

    /**
     * Récupérer l'image de couverture d'un film
     */
    @Security('jwt', ['user', 'admin'])
    @Get('{filmId}/cover')
    public async getCover(@Path() filmId: number): Promise<IFilmCover | null> {
        const db = DB.Connection;

        // Récupérer les métadonnées de la couverture
        const [covers] = await db.query<RowDataPacket[]>(
            'SELECT * FROM film_covers WHERE film_id = ? ORDER BY created_at DESC LIMIT 1',
            [filmId]
        );

        if (covers.length === 0) {
            return null;
        }

        const cover = covers[0];
        return {
            id: cover.id,
            film_id: cover.film_id,
            cover_path: cover.cover_path,
            file_type: cover.file_type,
            file_size: cover.file_size,
            created_at: cover.created_at,
            updated_at: cover.updated_at
        };
    }

    /**
     * Supprimer l'image de couverture d'un film
     */
    @Security('jwt', ['admin'])
    @Delete('{filmId}/cover')
    public async deleteCover(@Path() filmId: number): Promise<{ success: boolean }> {
        const db = DB.Connection;

        // Récupérer les métadonnées de la couverture
        const [covers] = await db.query<RowDataPacket[]>(
            'SELECT * FROM film_covers WHERE film_id = ?',
            [filmId]
        );

        if (covers.length === 0) {
            throw new ApiError(ErrorCode.NotFound, 'cover/not-found', 'Cover not found');
        }

        const cover = covers[0];
        const filepath = path.join(this.UPLOAD_DIR, cover.cover_path);

        // Supprimer le fichier s'il existe
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        // Supprimer les métadonnées de la base de données
        await db.query('DELETE FROM film_covers WHERE film_id = ?', [filmId]);

        return { success: true };
    }
}
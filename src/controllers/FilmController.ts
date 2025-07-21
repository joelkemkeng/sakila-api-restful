import { DB } from '../utility/ORM/DB';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ApiError } from '../utility/error/ApiError';
import { ErrorCode } from '../utility/error/ErrorCode';
import { 
  Body, 
  Delete, 
  Get, 
  Path, 
  Post, 
  Put, 
  Query, 
  Route, 
  Security, 
  Tags,
  SuccessResponse,
  Example
} from 'tsoa';

export interface Film {
  film_id: number;
  title: string;
  description: string;
  release_year: number;
  language_id: number;
  original_language_id: number | null;
  rental_duration: number;
  rental_rate: number;
  length: number | null;
  replacement_cost: number;
  rating: string;
  special_features: string | null;
  last_update: Date;
}

// Interface pour la pagination
export interface PaginatedFilms {
  data: Film[];
  total: number;
  page: number;
  pageSize: number;
}

// Interface pour la création/mise à jour de film
export interface FilmCreationParams {
  title: string;
  description?: string;
  release_year: number;
  language_id: number;
  original_language_id?: number;
  rental_duration?: number;
  rental_rate?: number;
  length?: number;
  replacement_cost?: number;
  rating?: string;
  special_features?: string;
}

@Route('films')
@Tags('Films')
export class FilmController {
  private db = DB.Connection;

  /**
   * Récupère la liste de tous les films avec pagination
   * @param page Numéro de la page (commence à 1)
   * @param pageSize Nombre d'éléments par page
   */
  @Get()
  @SuccessResponse(200, "Liste des films récupérée avec succès")
  async getFilms(
    @Query() page: number = 1, 
    @Query() pageSize: number = 10
  ): Promise<PaginatedFilms> {
    const offset = (page - 1) * pageSize;
    
    // Récupérer le nombre total de films
    const [countResult] = await this.db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM film'
    );
    const total = countResult[0].total;
    
    // Récupérer les films avec pagination
    const [films] = await this.db.query<RowDataPacket[]>(
      'SELECT * FROM film LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    return {
      data: films as Film[],
      total,
      page,
      pageSize
    };
  }
  
  /**
   * Récupère un film par son identifiant
   * @param id Identifiant unique du film
   */
  @Get('{id}')
  @SuccessResponse(200, "Film récupéré avec succès")
  async getFilmById(@Path() id: number): Promise<Film | null> {
    const [films] = await this.db.query<RowDataPacket[]>(
      'SELECT * FROM film WHERE film_id = ?',
      [id]
    );
    
    if (films.length === 0) {
      return null;
    }
    
    return films[0] as Film;
  }
  
  /**
   * Crée un nouveau film
   * @param filmData Données du film à créer
   */
  @Post()
  @Security('jwt', ['admin'])
  @SuccessResponse(201, "Film créé avec succès")
  async createFilm(@Body() filmData: FilmCreationParams): Promise<Film> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO film SET ?',
      [filmData]
    );
    
    const newFilm = await this.getFilmById(result.insertId);
    
    if (!newFilm) {
      throw new ApiError(ErrorCode.InternalError, 'film/creation-failed', 'Failed to create film');
    }
    
    return newFilm;
  }
  
  /**
   * Met à jour un film existant
   * @param id Identifiant du film à mettre à jour
   * @param filmData Nouvelles données du film
   */
  @Put('{id}')
  @Security('jwt', ['admin'])
  @SuccessResponse(200, "Film mis à jour avec succès")
  async updateFilm(@Path() id: number, @Body() filmData: Partial<FilmCreationParams>): Promise<Film | null> {
    // Vérifier si le film existe
    const film = await this.getFilmById(id);
    
    if (!film) {
      throw new ApiError(ErrorCode.NotFound, 'film/not-found', 'Film not found');
    }
    
    // Mise à jour du film
    await this.db.query(
      'UPDATE film SET ? WHERE film_id = ?',
      [filmData, id]
    );
    
    // Récupérer le film mis à jour
    return this.getFilmById(id);
  }
  
  /**
   * Supprime un film
   * @param id Identifiant du film à supprimer
   */
  @Delete('{id}')
  @Security('jwt', ['admin'])
  @SuccessResponse(204, "Film supprimé avec succès")
  async deleteFilm(@Path() id: number): Promise<boolean> {
    // Vérifier si le film existe
    const film = await this.getFilmById(id);
    
    if (!film) {
      throw new ApiError(ErrorCode.NotFound, 'film/not-found', 'Film not found');
    }
    
    // Suppression du film
    const [result] = await this.db.query<ResultSetHeader>(
      'DELETE FROM film WHERE film_id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
  
  /**
   * Récupère les films par catégorie
   * @param categoryId Identifiant de la catégorie
   * @param page Numéro de la page
   * @param pageSize Nombre d'éléments par page
   */
  @Get('category/{categoryId}')
  @SuccessResponse(200, "Films par catégorie récupérés avec succès")
  async getFilmsByCategory(
    @Path() categoryId: number, 
    @Query() page: number = 1, 
    @Query() pageSize: number = 10
  ): Promise<PaginatedFilms> {
    const offset = (page - 1) * pageSize;
    
    // Récupérer le nombre total de films dans cette catégorie
    const [countResult] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total 
       FROM film f
       JOIN film_category fc ON f.film_id = fc.film_id
       WHERE fc.category_id = ?`,
      [categoryId]
    );
    const total = countResult[0].total;
    
    // Récupérer les films avec pagination
    const [films] = await this.db.query<RowDataPacket[]>(
      `SELECT f.* 
       FROM film f
       JOIN film_category fc ON f.film_id = fc.film_id
       WHERE fc.category_id = ?
       LIMIT ? OFFSET ?`,
      [categoryId, pageSize, offset]
    );
    
    return {
      data: films as Film[],
      total,
      page,
      pageSize
    };
  }
  
  /**
   * Récupère les films par acteur
   * @param actorId Identifiant de l'acteur
   * @param page Numéro de la page
   * @param pageSize Nombre d'éléments par page 
   */
  @Get('actor/{actorId}')
  @SuccessResponse(200, "Films par acteur récupérés avec succès")
  async getFilmsByActor(
    @Path() actorId: number, 
    @Query() page: number = 1, 
    @Query() pageSize: number = 10
  ): Promise<PaginatedFilms> {
    const offset = (page - 1) * pageSize;
    
    // Récupérer le nombre total de films avec cet acteur
    const [countResult] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total 
       FROM film f
       JOIN film_actor fa ON f.film_id = fa.film_id
       WHERE fa.actor_id = ?`,
      [actorId]
    );
    const total = countResult[0].total;
    
    // Récupérer les films avec pagination
    const [films] = await this.db.query<RowDataPacket[]>(
      `SELECT f.* 
       FROM film f
       JOIN film_actor fa ON f.film_id = fa.film_id
       WHERE fa.actor_id = ?
       LIMIT ? OFFSET ?`,
      [actorId, pageSize, offset]
    );
    
    return {
      data: films as Film[],
      total,
      page,
      pageSize
    };
  }
}

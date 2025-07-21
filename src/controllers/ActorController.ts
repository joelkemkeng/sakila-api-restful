import { DB } from "../utility/ORM/DB";
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
  SuccessResponse
} from 'tsoa';

export interface Actor {
  actor_id: number;
  first_name: string;
  last_name: string;
  last_update: Date;
}

// Interface pour la pagination
export interface PaginatedActors {
  data: Actor[];
  total: number;
  page: number;
  pageSize: number;
}

// Interface pour la création/mise à jour d'acteur
export interface ActorCreationParams {
  first_name: string;
  last_name: string;
}

@Route('actors')
@Tags('Actors')
export class ActorController {
  private db = DB.Connection;

  /**
   * Récupère la liste de tous les acteurs avec pagination
   * @param page Numéro de la page (commence à 1)
   * @param pageSize Nombre d'éléments par page
   */
  @Get()
  @SuccessResponse(200, "Liste des acteurs récupérée avec succès")
  async getActors(
    @Query() page: number = 1, 
    @Query() pageSize: number = 10
  ): Promise<PaginatedActors> {
    const offset = (page - 1) * pageSize;
    
    // Récupérer le nombre total d'acteurs
    const [countResult] = await this.db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM actor'
    );
    const total = countResult[0].total;
    
    // Récupérer les acteurs avec pagination
    const [actors] = await this.db.query<RowDataPacket[]>(
      'SELECT * FROM actor LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    return {
      data: actors as Actor[],
      total,
      page,
      pageSize
    };
  }
  
  /**
   * Récupère un acteur par son identifiant
   * @param id Identifiant unique de l'acteur
   */
  @Get('{id}')
  @SuccessResponse(200, "Acteur récupéré avec succès")
  async getActorById(@Path() id: number): Promise<Actor | null> {
    const [actors] = await this.db.query<RowDataPacket[]>(
      'SELECT * FROM actor WHERE actor_id = ?',
      [id]
    );
    
    if (actors.length === 0) {
      return null;
    }
    
    return actors[0] as Actor;
  }
  
  /**
   * Crée un nouvel acteur
   * @param actorData Données de l'acteur à créer
   */
  @Post()
  @Security('jwt', ['admin'])
  @SuccessResponse(201, "Acteur créé avec succès")
  async createActor(@Body() actorData: ActorCreationParams): Promise<Actor> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO actor SET ?',
      [actorData]
    );
    
    const newActor = await this.getActorById(result.insertId);
    
    if (!newActor) {
      throw new ApiError(ErrorCode.InternalError, 'actor/creation-failed', 'Failed to create actor');
    }
    
    return newActor;
  }
  
  /**
   * Met à jour un acteur existant
   * @param id Identifiant de l'acteur à mettre à jour
   * @param actorData Nouvelles données de l'acteur
   */
  @Put('{id}')
  @Security('jwt', ['admin'])
  @SuccessResponse(200, "Acteur mis à jour avec succès")
  async updateActor(@Path() id: number, @Body() actorData: ActorCreationParams): Promise<Actor | null> {
    // Vérifier si l'acteur existe
    const actor = await this.getActorById(id);
    
    if (!actor) {
      throw new ApiError(ErrorCode.NotFound, 'actor/not-found', 'Actor not found');
    }
    
    // Mise à jour de l'acteur
    await this.db.query(
      'UPDATE actor SET ? WHERE actor_id = ?',
      [actorData, id]
    );
    
    // Récupérer l'acteur mis à jour
    return this.getActorById(id);
  }
  
  /**
   * Supprime un acteur
   * @param id Identifiant de l'acteur à supprimer
   */
  @Delete('{id}')
  @Security('jwt', ['admin'])
  @SuccessResponse(204, "Acteur supprimé avec succès")
  async deleteActor(@Path() id: number): Promise<boolean> {
    // Vérifier si l'acteur existe
    const actor = await this.getActorById(id);
    
    if (!actor) {
      throw new ApiError(ErrorCode.NotFound, 'actor/not-found', 'Actor not found');
    }
    
    // Suppression de l'acteur
    const [result] = await this.db.query<ResultSetHeader>(
      'DELETE FROM actor WHERE actor_id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
  
  /**
   * Récupère les films d'un acteur spécifique
   * @param id Identifiant de l'acteur
   * @param page Numéro de la page
   * @param pageSize Nombre d'éléments par page
   */
  @Get('{id}/films')
  @SuccessResponse(200, "Films de l'acteur récupérés avec succès")
  async getActorFilms(
    @Path() id: number, 
    @Query() page: number = 1, 
    @Query() pageSize: number = 10
  ): Promise<{ data: any[], total: number, page: number, pageSize: number }> {
    // Vérifier si l'acteur existe
    const actor = await this.getActorById(id);
    
    if (!actor) {
      throw new ApiError(ErrorCode.NotFound, 'actor/not-found', 'Actor not found');
    }
    
    const offset = (page - 1) * pageSize;
    
    // Récupérer le nombre total de films pour cet acteur
    const [countResult] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total 
       FROM film f
       JOIN film_actor fa ON f.film_id = fa.film_id
       WHERE fa.actor_id = ?`,
      [id]
    );
    const total = countResult[0].total;
    
    // Récupérer les films avec pagination
    const [films] = await this.db.query<RowDataPacket[]>(
      `SELECT f.* 
       FROM film f
       JOIN film_actor fa ON f.film_id = fa.film_id
       WHERE fa.actor_id = ?
       LIMIT ? OFFSET ?`,
      [id, pageSize, offset]
    );
    
    return {
      data: films,
      total,
      page,
      pageSize
    };
  }
}

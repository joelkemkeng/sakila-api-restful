import { DB } from '../utility/ORM/DB';
import { Log } from '../utility/logging/Logger';

// Types explicites pour les arguments
interface FilmFilter {
  title?: string;
  releaseYear?: number;
  rating?: string;
  language?: string;
  category?: string;
  actor?: string;
}

interface FilmPaginationArgs {
  first?: number;
  after?: string;
  filter?: FilmFilter;
}

export const resolvers = {
  Query: {
    // Récupérer un film par ID
    film: async (_: unknown, { id }: { id: string }) => {
      try {
        const [rows]: any = await DB.Connection.query(
          'SELECT * FROM film WHERE film_id = ?',
          [id]
        );
        return rows[0] || null;
      } catch (error: any) {
        Log(`Erreur lors de la récupération du film ID ${id}:`, error);
        throw new Error(`Erreur lors de la récupération du film: ${error.message}`);
      }
    },

    // Récupérer une liste de films avec pagination
    films: async (_: unknown, { first = 10, after, filter }: FilmPaginationArgs) => {
      try {
        let query = 'SELECT SQL_CALC_FOUND_ROWS f.* FROM film f';
        const params: any[] = [];

        // Filtres dynamiques
        const conditions: string[] = [];

        if (filter) {
          if (filter.title) {
            conditions.push('f.title LIKE ?');
            params.push(`%${filter.title}%`);
          }
          if (filter.releaseYear) {
            conditions.push('f.release_year = ?');
            params.push(filter.releaseYear);
          }
          if (filter.rating) {
            conditions.push('f.rating = ?');
            params.push(filter.rating);
          }
          if (filter.language) {
            query += ' JOIN language l ON f.language_id = l.language_id';
            conditions.push('l.name LIKE ?');
            params.push(`%${filter.language}%`);
          }
          if (filter.category) {
            query += ' JOIN film_category fc ON f.film_id = fc.film_id JOIN category c ON fc.category_id = c.category_id';
            conditions.push('c.name LIKE ?');
            params.push(`%${filter.category}%`);
          }
          if (filter.actor) {
            query += ' JOIN film_actor fa ON f.film_id = fa.film_id JOIN actor a ON fa.actor_id = a.actor_id';
            conditions.push('CONCAT(a.first_name, " ", a.last_name) LIKE ?');
            params.push(`%${filter.actor}%`);
          }

          if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
          }
        }

        // Gestion du curseur pour pagination
        if (after) {
          const decodedCursor = Buffer.from(after, 'base64').toString('ascii');
          const cursorFilmId = parseInt(decodedCursor, 10);
          query += (conditions.length > 0 ? ' AND' : ' WHERE') + ' f.film_id > ?';
          params.push(cursorFilmId);
        }

        query += ' ORDER BY f.film_id LIMIT ?';
        params.push(first + 1); // +1 pour détecter s'il y a une page suivante

        // Exécuter la requête principale
        const [films]: any = await DB.Connection.query(query, params);

        // Total des résultats (sans limite)
        const [[totalCountRow]]: any = await DB.Connection.query('SELECT FOUND_ROWS() as count');

        const hasNextPage = films.length > first;
        if (hasNextPage) {
          films.pop();
        }

        const edges = films.map((film: any) => ({
          node: film,
          cursor: Buffer.from(film.film_id.toString()).toString('base64')
        }));

        return {
          edges,
          pageInfo: {
            hasNextPage,
            hasPreviousPage: !!after,
            startCursor: edges.length ? edges[0].cursor : null,
            endCursor: edges.length ? edges[edges.length - 1].cursor : null
          },
          totalCount: totalCountRow.count
        };
      } catch (error: any) {
        Log('Erreur lors de la récupération des films:', error);
        throw new Error(`Erreur lors de la récupération des films: ${error.message}`);
      }
    },

    // Récupérer un acteur par ID
    actor: async (_: unknown, { id }: { id: string }) => {
      try {
        const [rows]: any = await DB.Connection.query(
          'SELECT * FROM actor WHERE actor_id = ?',
          [id]
        );
        return rows[0] || null;
      } catch (error: any) {
        Log(`Erreur lors de la récupération de l'acteur ID ${id}:`, error);
        throw new Error(`Erreur lors de la récupération de l'acteur: ${error.message}`);
      }
    },

    // Récupérer toutes les catégories
    categories: async () => {
      try {
        const [rows]: any = await DB.Connection.query('SELECT * FROM category');
        return rows;
      } catch (error: any) {
        Log('Erreur lors de la récupération des catégories:', error);
        throw new Error(`Erreur lors de la récupération des catégories: ${error.message}`);
      }
    },

    // Récupérer toutes les langues
    languages: async () => {
      try {
        const [rows]: any = await DB.Connection.query('SELECT * FROM language');
        return rows;
      } catch (error: any) {
        Log('Erreur lors de la récupération des langues:', error);
        throw new Error(`Erreur lors de la récupération des langues: ${error.message}`);
      }
    }
  },

  // Résolveurs de relations
  Film: {
    actors: async (film: any) => {
      try {
        const [rows]: any = await DB.Connection.query(
          `SELECT a.* FROM actor a
           JOIN film_actor fa ON a.actor_id = fa.actor_id
           WHERE fa.film_id = ?`,
          [film.film_id]
        );
        return rows;
      } catch (error: any) {
        Log(`Erreur lors de la récupération des acteurs du film ID ${film.film_id}:`, error);
        return [];
      }
    },

    categories: async (film: any) => {
      try {
        const [rows]: any = await DB.Connection.query(
          `SELECT c.* FROM category c
           JOIN film_category fc ON c.category_id = fc.category_id
           WHERE fc.film_id = ?`,
          [film.film_id]
        );
        return rows;
      } catch (error: any) {
        Log(`Erreur lors de la récupération des catégories du film ID ${film.film_id}:`, error);
        return [];
      }
    },

    language: async (film: any) => {
      try {
        if (!film.language_id) return null;
        const [rows]: any = await DB.Connection.query(
          'SELECT * FROM language WHERE language_id = ?',
          [film.language_id]
        );
        return rows[0] || null;
      } catch (error: any) {
        Log(`Erreur lors de la récupération de la langue du film ID ${film.film_id}:`, error);
        return null;
      }
    }
  },

  Actor: {
    films: async (actor: any) => {
      try {
        const [rows]: any = await DB.Connection.query(
          `SELECT f.* FROM film f
           JOIN film_actor fa ON f.film_id = fa.film_id
           WHERE fa.actor_id = ?`,
          [actor.actor_id]
        );
        return rows;
      } catch (error: any) {
        Log(`Erreur lors de la récupération des films de l'acteur ID ${actor.actor_id}:`, error);
        return [];
      }
    }
  },

  Category: {
    films: async (category: any) => {
      try {
        const [rows]: any = await DB.Connection.query(
          `SELECT f.* FROM film f
           JOIN film_category fc ON f.film_id = fc.film_id
           WHERE fc.category_id = ?`,
          [category.category_id]
        );
        return rows;
      } catch (error: any) {
        Log(`Erreur lors de la récupération des films de la catégorie ID ${category.category_id}:`, error);
        return [];
      }
    }
  },

  Mutation: {
    createFilm: async (_: unknown, filmData: any) => {
      try {
        const [result]: any = await DB.Connection.query(
          'INSERT INTO film SET ?',
          [filmData]
        );
        const filmId = result.insertId;
        const [rows]: any = await DB.Connection.query(
          'SELECT * FROM film WHERE film_id = ?',
          [filmId]
        );
        return rows[0] || null;
      } catch (error: any) {
        Log('Erreur lors de la création du film:', error);
        throw new Error(`Erreur lors de la création du film: ${error.message}`);
      }
    },

    updateFilm: async (_: unknown, { film_id, ...updateData }: any) => {
      try {
        const [existingFilm]: any = await DB.Connection.query(
          'SELECT * FROM film WHERE film_id = ?',
          [film_id]
        );
        if (!existingFilm[0]) {
          throw new Error(`Film avec l'ID ${film_id} non trouvé`);
        }

        await DB.Connection.query(
          'UPDATE film SET ? WHERE film_id = ?',
          [updateData, film_id]
        );

        const [updatedFilm]: any = await DB.Connection.query(
          'SELECT * FROM film WHERE film_id = ?',
          [film_id]
        );
        return updatedFilm[0] || null;
      } catch (error: any) {
        Log(`Erreur lors de la mise à jour du film ID ${film_id}:`, error);
        throw new Error(`Erreur lors de la mise à jour du film: ${error.message}`);
      }
    }
  }
};

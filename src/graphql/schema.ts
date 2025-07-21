import { gql } from 'apollo-server-express';

// Définition du schéma GraphQL
export const typeDefs = gql`
  # Types
  type Film {
    film_id: ID!
    title: String!
    description: String
    release_year: Int
    language: Language
    original_language: Language
    rental_duration: Int
    rental_rate: Float
    length: Int
    replacement_cost: Float
    rating: String
    special_features: [String]
    last_update: String
    actors: [Actor]
    categories: [Category]
  }

  type Actor {
    actor_id: ID!
    first_name: String!
    last_name: String!
    last_update: String
    films: [Film]
  }

  type Category {
    category_id: ID!
    name: String!
    last_update: String
    films: [Film]
  }

  type Language {
    language_id: ID!
    name: String!
    last_update: String
  }

  # Pagination
  type FilmConnection {
    edges: [FilmEdge]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type FilmEdge {
    node: Film!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # Inputs
  input FilmFilter {
    title: String
    category: String
    actor: String
    language: String
    rating: String
    releaseYear: Int
  }

  # Requêtes
  type Query {
    # Films
    film(id: ID!): Film
    films(first: Int, after: String, filter: FilmFilter): FilmConnection
    
    # Acteurs
    actor(id: ID!): Actor
    actors(first: Int, after: String, name: String): [Actor]
    
    # Catégories
    category(id: ID!): Category
    categories: [Category]
    
    # Langues
    languages: [Language]
  }

  # Mutations
  type Mutation {
    # Film mutations
    createFilm(
      title: String!,
      description: String,
      release_year: Int,
      language_id: ID!,
      rental_duration: Int = 3,
      rental_rate: Float = 4.99,
      length: Int,
      replacement_cost: Float = 19.99,
      rating: String = "G"
    ): Film
    
    updateFilm(
      film_id: ID!,
      title: String,
      description: String,
      release_year: Int,
      language_id: ID,
      rental_duration: Int,
      rental_rate: Float,
      length: Int,
      replacement_cost: Float,
      rating: String
    ): Film
    
    deleteFilm(film_id: ID!): Boolean
    
    # Actor mutations
    addActorToFilm(film_id: ID!, actor_id: ID!): Film
    removeActorFromFilm(film_id: ID!, actor_id: ID!): Film
    
    # Category mutations
    addCategoryToFilm(film_id: ID!, category_id: ID!): Film
    removeCategoryFromFilm(film_id: ID!, category_id: ID!): Film
  }
`;

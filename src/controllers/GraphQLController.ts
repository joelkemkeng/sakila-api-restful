import { Controller, Route, Post, Body, Tags, Example, Security } from "tsoa";
import { resolvers } from "../graphql/resolvers";
import { typeDefs } from "../graphql/schema";
import { ApolloServer } from "@apollo/server";
import { Request, Response } from "express";

/**
 * Interface de requête GraphQL
 */
interface GraphQLRequest {
  query: string;
  variables?: { [key: string]: any };
  operationName?: string;
}

/**
 * Exemple de requête GraphQL pour la documentation
 */
const exampleQuery = {
  query: `{
    films(first: 5) {
      edges {
        node {
          film_id
          title
          description
          actors {
            actor_id
            first_name
            last_name
          }
        }
      }
      totalCount
    }
  }`,
  variables: {}
};

/**
 * Contrôleur pour l'endpoint GraphQL
 */
@Route("graphql")
@Tags("GraphQL")
export class GraphQLController extends Controller {
  
  /**
   * Endpoint GraphQL
   * Permet d'exécuter des requêtes GraphQL pour récupérer des données sur les films et les acteurs
   * @param requestBody La requête GraphQL à exécuter
   * @example requestBody {
   *   "query": "{films(first: 5) { edges { node { film_id title description actors { actor_id first_name last_name } } } totalCount } }",
   *   "variables": {}
   * }
   */
  @Post()
  @Example<GraphQLRequest>(exampleQuery)
  @Security("jwt", ["user", "admin"])
  public async query(@Body() requestBody: GraphQLRequest): Promise<any> {
    // Initialisation d'un serveur Apollo pour traiter la requête
    const server = new ApolloServer({ 
      typeDefs, 
      resolvers
    });

    // Démarrer le serveur
    await server.start();

    // Traitement de la requête GraphQL
    const result = await server.executeOperation({
      query: requestBody.query,
      variables: requestBody.variables || {},
      operationName: requestBody.operationName
    });

    // Arrêter le serveur pour libérer les ressources
    await server.stop();

    // Retourne directement le résultat
    return result;
  }
}

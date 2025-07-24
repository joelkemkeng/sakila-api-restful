import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express, { Express } from 'express';
import http from 'http';
import { typeDefs as GRAPHQL_SCHEMA } from '../graphql/schema';
import { resolvers as GRAPHQL_RESOLVERS } from '../graphql/resolvers';
import { Log } from '../utility/logging/Logger';
import cors from 'cors';
import { json } from 'body-parser';

class GraphQLRoutes {
  private apolloServer: ApolloServer | null = null;

  /**
   * Démarre le serveur Apollo GraphQL
   */
  async start(): Promise<void> {
    Log(' Initialisation du serveur GraphQL...');

    // Création du serveur Apollo avec le schéma et les résolveurs
    this.apolloServer = new ApolloServer({
      typeDefs: GRAPHQL_SCHEMA,
      resolvers: GRAPHQL_RESOLVERS,
      introspection: true, // Utile pour explorer le schéma GraphQL avec des outils
    });

    // Démarrage du serveur Apollo
    await this.apolloServer.start();
    
    Log(' Serveur GraphQL initialisé et prêt');
  }

  /**
   * Configure le middleware GraphQL pour l'application Express
   */
  async applyMiddleware(app: Express): Promise<void> {
    if (!this.apolloServer) {
      throw new Error('Apollo Server not initialized. Call start() first.');
    }

    // Ajout des middleware nécessaires directement à l'application Express principale
    app.use(
      '/graphql',
      cors(),
      json(),
      expressMiddleware(this.apolloServer) as any // Cast pour résoudre les problèmes de typage
    );

    if (process.env.NODE_ENV !== 'production') {
      Log(` Endpoint GraphQL disponible sur: http://localhost:${process.env.PORT || 5050}/graphql`);
    }
  }
}

// Exporter une instance de la classe pour qu'elle puisse être importée dans server_manager.ts
export default new GraphQLRoutes();

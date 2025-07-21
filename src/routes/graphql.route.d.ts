import http from 'http';

export interface GraphQLRoutes {
  start(): Promise<void>;
  createHandler(): Promise<(httpServer: http.Server) => void>;
}

export const graphqlRoutes: GraphQLRoutes;

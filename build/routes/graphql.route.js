"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGraphQL = void 0;
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const resolvers_graphql_1 = require("../model/graphql/resolvers.graphql");
const schema_graphql_1 = require("../model/graphql/schema.graphql");
const express_1 = require("express");
const initGraphQL = async (server) => {
    const apollo = new server_1.ApolloServer({
        typeDefs: schema_graphql_1.GRAPHQL_SCHEMA,
        resolvers: resolvers_graphql_1.GRAPHQL_RESOLVERS,
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer: server })],
    });
    await apollo.start();
    const router = (0, express_1.Router)({ mergeParams: true });
    router.use((0, express4_1.expressMiddleware)(apollo, {
    /*
    context: async ({ req, res }) => {
      try {
        return await expressAuthentication(<any>req, 'jwt');
      } catch (err: any) {
        throw new GraphQLError('User is not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: err.httpCode },
          }
        });
      }
    }
    */
    }));
    return router;
};
exports.initGraphQL = initGraphQL;

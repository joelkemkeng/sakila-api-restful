"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopServer = exports.StartServer = void 0;
const error_handler_middleware_1 = require("./utility/error/error-handler.middleware");
const Log_1 = require("./utility/logging/Log");
const log_middleware_1 = require("./utility/logging/log.middleware");
const graphql_route_1 = require("./routes/graphql.route");
const body_parser_1 = require("body-parser");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const routes_1 = require("./routes/routes");
const cors_1 = __importDefault(require("cors"));
const StartServer = async () => {
    // Récupérer le port des variables d'environnement ou préciser une valeur par défaut
    const PORT = process.env.PORT || 5050;
    // Créer l'objet Express
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    // Configurer CORS
    app.use((0, cors_1.default)());
    // L'appli parse le corps du message entrant comme du json
    app.use((0, body_parser_1.json)());
    // Utiliser un middleware pour créer des logs
    app.use((0, log_middleware_1.requestLogMiddleware)('req'));
    // Graphql
    const graphql = await (0, graphql_route_1.initGraphQL)(httpServer);
    app.use('/graphql', graphql);
    (0, routes_1.RegisterRoutes)(app);
    // Créer un endpoint GET
    app.get('/info', (request, response, next) => {
        response.send("<h1>Hello world!</h1>");
    });
    // Servir le contenu static du dossier `public`
    app.use(express_1.default.static("public"));
    // Créer une route qui permet de convertir le .json en format html
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(undefined, {
        swaggerOptions: {
            url: "/swagger.json",
        },
    }));
    // Ajouter un handler pour les erreurs
    app.use(error_handler_middleware_1.DefaultErrorHandler);
    // Lancer le serveur
    return new Promise((resolve) => {
        httpServer.listen(PORT, () => {
            (0, Log_1.Log)(`API Listening on port ${PORT}`);
            resolve(httpServer);
        });
    });
};
exports.StartServer = StartServer;
const StopServer = async (server) => {
    if (!server) {
        return;
    }
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
exports.StopServer = StopServer;

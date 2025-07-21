"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerSimple = exports.ROUTES_USER = void 0;
const express_1 = require("express");
// Middleware d'autorisation
const authorizeUser = (request, response, next) => {
    const authenticated = true; // Remplacez avec la vraie logique d'authentification
    if (authenticated) {
        next();
    }
    else {
        response.status(403).json({ error: "User not authenticated" });
    }
};
// Index des utilisateurs
const ROUTES_USER = (0, express_1.Router)({ mergeParams: true });
exports.ROUTES_USER = ROUTES_USER;
ROUTES_USER.get('/', (request, response, next) => {
    // Retourner une liste d'utilisateurs, avec pagination par exemple
    response.json({
        type: 'index',
        query: request.query
    });
});
// Affichage / Manipulation d'un utilisateur
const routerSimple = (0, express_1.Router)({ mergeParams: true });
exports.routerSimple = routerSimple;
// Utiliser le middleware d'autorisation pour les routes sous /:userId
routerSimple.use(authorizeUser);
routerSimple.get('/', (request, response, next) => {
    // Retourner la fiche utilisateur pour :userId
    response.json({
        type: 'get',
        params: request.params,
        query: request.query,
    });
});
routerSimple.put('/', (request, response, next) => {
    // Mettre à jour la fiche utilisateur pour :userId
    response.json({
        type: 'put',
        params: request.params,
        query: request.query,
        body: request.body
    });
});

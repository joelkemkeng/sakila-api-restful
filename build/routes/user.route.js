"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROUTES_USER = void 0;
const express_1 = require("express");
const DB_1 = require("../utility/ORM/DB");
const router = (0, express_1.Router)({ mergeParams: true });
router.use((request, response, next) => {
    console.log("this is a middleware");
    const auth = request.headers.authorization;
    console.log(auth);
    if (!auth || auth !== 'Bearer 12345') {
        next("Unidentified user!");
        return;
    }
    next();
});
// Créer un utilisateur
router.put('/', async (request, response, next) => {
    console.log(request.body);
    try {
        const db = DB_1.DB.Connection;
        const result = await db.query('insert into user set ?', request.body);
        response.send({
            id: result[0].insertId
        });
    }
    catch (err) {
        next(err.message);
    }
});
// Lire les utilisateurs
router.get('/', async (request, response, next) => {
    const db = DB_1.DB.Connection;
    const limit = parseInt(request.query.limit) || 10;
    const offset = (parseInt(request.query.page) || 0) * limit;
    try {
        const data = await db.query("select userId, email, familyName, givenName from user limit ? offset ?", [limit, offset]);
        const count = await db.query("select count(*) as count from user");
        response.send({
            total: count[0][0].count,
            rows: data[0]
        });
    }
    catch (err) {
        next(err.message);
    }
});
// Lire un utilisateur avec ID userId
router.get('/:userId', async (request, response, next) => {
    console.log(`Le userId est: ${request.params.userId}`);
    const db = DB_1.DB.Connection;
    try {
        const data = await db.query('select userId, familyName, givenName, email from user where userId = ?', [request.params.userId]);
        response.send(data[0][0]);
    }
    catch (err) {
        next(err.message);
    }
});
// Mettre à jour un utilisteur
router.patch('/:userId', async (request, response, next) => {
    console.log(`Le userId est: ${request.params.userId}`);
    try {
        const db = DB_1.DB.Connection;
        const result = await db.query('update user set ? where userId = ?', [request.body, request.params.userId]);
        response.send({
            id: result[0].insertId
        });
    }
    catch (err) {
        next(err.message);
    }
});
// Supprimer un utilisateur
router.delete('/:userId', async (request, response, next) => {
    console.log(`Le userId est: ${request.params.userId}`);
    try {
        const db = DB_1.DB.Connection;
        const result = await db.query('delete from user where userId = ?', [request.params.userId]);
        response.send({
            id: result[0].insertId
        });
    }
    catch (err) {
        next(err.message);
    }
});
exports.ROUTES_USER = router;

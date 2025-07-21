"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("./utility/logging/Log");
const DB_1 = require("./utility/ORM/DB");
const server_manager_1 = require("./server_manager");
(0, server_manager_1.StartServer)().then((server) => {
    const shutdown = async () => {
        (0, Log_1.Log)("Stopping server...");
        await (0, server_manager_1.StopServer)(server);
        (0, Log_1.Log)("Closing DB connections...");
        await DB_1.DB.Close();
        (0, Log_1.Log)("Ready to quit.");
    };
    // For nodemon restarts
    process.once('SIGUSR2', async function () {
        await shutdown();
        process.kill(process.pid, 'SIGUSR2');
    });
    // For app termination
    process.on('SIGINT', async function () {
        await shutdown();
        process.exit(0);
    });
    // For Heroku app termination
    process.on('SIGTERM', async function () {
        await shutdown();
        process.exit(0);
    });
});

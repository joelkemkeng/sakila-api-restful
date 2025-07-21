import { Log } from "./utility/logging/Logger";
import { DB } from "./utility/ORM/DB";
import { ServerManager } from "./server_manager";

ServerManager.StartServer().then(
  (server: any) => {
    
    const shutdown = async () => {
      Log("Stopping server...");
      await ServerManager.StopServer(server);
      Log("Closing DB connections...");
      await DB.Close();
      Log("Ready to quit.");
    }    

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
  }
).catch((err: Error) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
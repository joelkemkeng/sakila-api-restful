import { NextFunction, Request, Response } from 'express';
import express, { json, Express } from 'express';
import cors from 'cors';
import { Server } from 'http';
import { ApiError } from './utility/error/ApiError';
import { ErrorCode } from './utility/error/ErrorCode';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { DB } from './utility/ORM/DB';
import { authRouter } from './routes/auth.route';
import { requestLogMiddleware, debugLoggerMiddleware } from './middleware/logging.middleware';
import { infoRouter } from './routes/sys.route';
import { requestLoggerCsv, Log } from './utility/logging/Logger';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 5050;
const FAST_START = process.env.FAST_START === 'true';

let swaggerDoc: any = null;

async function initDBConnection(): Promise<void> {
  try {
    await DB.Connection.query('SELECT 1');
    Log(' Base de données connectée et prête');
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
}

async function initGraphQL(app: Express): Promise<void> {
  try {
    const graphqlModule = await import('./routes/graphql.route');
    const graphqlRoutes = graphqlModule.default;
    await graphqlRoutes.start();
    await graphqlRoutes.applyMiddleware(app);
    Log(` Endpoint GraphQL initialisé sur http://localhost:${PORT}/graphql`);
  } catch (error: any) {
    Log(' Erreur lors de l\'initialisation de GraphQL');
    console.error(error);
  }
}

export async function createServer(): Promise<Server> {
  const app = express() as Express;
  const httpServer = new Server(app);

  app.use(cors());
  app.use(json({ limit: '50mb' }));

  if (!FAST_START) {
    app.use(requestLogMiddleware('HTTP'));
  }

  if (process.env.NODE_ENV !== 'production' && !FAST_START) {
    app.use(debugLoggerMiddleware);
  }

  await initDBConnection();

  try {
    try {
      const { RegisterRoutes } = await import('./routes/routes');
      const router = Router();
      RegisterRoutes(router);
      app.use('/', router);
      Log(' Routes TSOA chargées avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement des routes TSOA:', error);
      Log(' Erreur lors du chargement des routes TSOA. Certaines fonctionnalités peuvent être indisponibles.');
      const router = Router();
      app.use('/', router);
    }

    app.use('/', authRouter);
    app.use('/', infoRouter);

    app.use('/films', upload.single('cover')); // Ajout du middleware de fichier

    if (!FAST_START) {
      app.use('/api-docs', swaggerUi.serve, async (req: Request, res: Response, next: NextFunction) => {
        if (!swaggerDoc) {
          try {
            swaggerDoc = require('../public/swagger.json');
          } catch (error) {
            try {
              swaggerDoc = require('../build/swagger.json');
            } catch (error) {
              console.error('Impossible de charger la documentation Swagger', error);
              return next(new ApiError(ErrorCode.InternalError, 'swagger/not-found', 'Swagger doc not found'));
            }
          }
        }
        const swaggerSetup = swaggerUi.setup(swaggerDoc, {
          explorer: true,
          customCss: '.swagger-ui .topbar { display: none }',
          swaggerOptions: {
            docExpansion: 'list',
            filter: true,
            showRequestDuration: true,
          }
        });
        return swaggerSetup(req, res, next);
      });
      Log(` Documentation API disponible sur http://localhost:${PORT}/api-docs`);
    }

    if (!FAST_START) {
      await initGraphQL(app);
    }

    app.use('/public', express.static('public'));
    app.use('/covers', express.static('public/covers'));

    app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
    });

    app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({
        error: 'Not Found',
        message: `La ressource ${req.path} n'existe pas`,
      });
    });

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof ApiError) {
        res.status(err.httpCode).json({
          error: err.structuredError,
          message: err.errMessage,
          code: err.httpCode,
          details: err.errDetails || undefined,
        });
      } else {
        console.error('Erreur non gérée:', err);
        res.status(500).json({
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'production' ? 'Une erreur est survenue' : err.message,
        });
      }
    });

    return httpServer;
  } catch (error) {
    console.error('Erreur lors de la création du serveur:', error);
    process.exit(1);
  }
}

export class ServerManager {
  static async StartServer(): Promise<Server> {
    const server = await createServer();
    server.listen({ port: PORT, host: '0.0.0.0' }, () => {
      Log(`Server running at http://127.0.0.1:${PORT}`);
    });
    return server;
  }

  static async StopServer(server: Server): Promise<void> {
    if (!server) return;
    return new Promise((resolve, reject) => {
      server.close((err: any) => {
        if (err) {
          console.error('Erreur lors de l\'arrêt du serveur:', err);
          reject(err);
        } else {
          console.log('Serveur arrêté');
          resolve();
        }
      });
    });
  }
}

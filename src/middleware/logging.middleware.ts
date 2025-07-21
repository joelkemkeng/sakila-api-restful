import express, { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour journaliser les requêtes HTTP
 */
export const requestLogMiddleware = (category: string = 'HTTP') => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(`[${category}] ${req.method} request for ${req.url}`);
    next();
  };
};

/**
 * Middleware pour le débogage en développement
 */
export const debugLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Une fois la réponse terminée
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[DEBUG] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

/**
 * Middleware pour journaliser toutes les requêtes entrantes
 * @param app Application Express
 */
export function registerRequestLogger(app: express.Express) {
  // Simple middleware de journalisation pour debug
  app.use(requestLogMiddleware());

  // Middleware simple de log de requêtes
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${ms}ms`);
    });
    next();
  });
}

/**
 * Middleware pour journaliser les erreurs
 * @param app Application Express
 */
export function registerErrorLogger(app: express.Express) {
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`ERROR: ${err.message} - ${req.method} ${req.url}`);
    if (err.stack) {
      console.error(err.stack);
    }
    next(err);
  });
}

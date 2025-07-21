import winston from 'winston';

/**
 * Système de logging centralisé
 * Permet de tracer uniformément toutes les actions dans l'application
 */
class LoggerService {
  private static instance: LoggerService;
  private _logger: winston.Logger;

  private constructor() {
    // Création de l'instance winston logger
    this._logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'film-api' },
      transports: [
        // Écriture dans la console pour le développement
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(info => {
              const { timestamp, level, message, ...rest } = info;
              const metaData = Object.keys(rest).length ? JSON.stringify(rest) : '';
              return `${timestamp} [${level}]: ${message} ${metaData}`;
            })
          )
        }),
        // Fichier pour toutes les logs
        new winston.transports.File({ filename: 'logs/combined.log' }),
        // Fichier séparé pour les erreurs
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
      ]
    });
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  // Getter pour exposer directement l'instance winston.Logger
  public get logger(): winston.Logger {
    return this._logger;
  }

  // Méthodes de logging
  public info(message: string, meta: object = {}): void {
    this._logger.info(message, meta);
  }

  public warn(message: string, meta: object = {}): void {
    this._logger.warn(message, meta);
  }

  public error(message: string, error?: any, meta: object = {}): void {
    if (error) {
      this._logger.error(message, { error, ...meta });
    } else {
      this._logger.error(message, meta);
    }
  }

  public debug(message: string, meta: object = {}): void {
    this._logger.debug(message, meta);
  }

  public http(message: string, meta: object = {}): void {
    this._logger.http(message, meta);
  }
}

// Export du service de logging (singleton)
export const loggerService = LoggerService.getInstance();

// Export de l'instance winston.Logger directe pour les middlewares comme express-winston
export const logger = loggerService.logger;

// Fonction de logging simple pour les messages de console
export const Log = (message: string, ...optionalParams: any[]) => {
  console.log(message, ...optionalParams);
  return message;
};

// Export pour la journalisation des requêtes au format CSV
export const requestLoggerCsv = {
  log: (req: any, res: any, next: any) => {
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      loggerService.info('API Request', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`
      });
    });
    next();
  }
};

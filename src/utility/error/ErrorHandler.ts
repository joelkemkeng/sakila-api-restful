import { NextFunction, Request, Response } from 'express';
import { logger } from '../logging/Logger';

// Types d'erreurs standard de l'API
export enum ErrorCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  InternalServerError = 500
}

// Classe d'erreur standard pour l'API
export class ApiError extends Error {
  public code: ErrorCode;
  public errorCode: string;

  constructor(code: ErrorCode, errorCode: string, message: string) {
    super(message);
    this.code = code;
    this.errorCode = errorCode;
    this.name = 'ApiError';
  }
}

// Middleware de gestion centralisée des erreurs
export const errorHandlerMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Déterminer le code d'erreur
  let statusCode = ErrorCode.InternalServerError;
  let errorCode = 'internal/unknown-error';
  let message = 'Une erreur inattendue est survenue';

  if (err instanceof ApiError) {
    statusCode = err.code;
    errorCode = err.errorCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = ErrorCode.BadRequest;
    errorCode = 'validation/invalid-input';
    message = err.message;
  }

  // Logguer l'erreur avec les détails pertinents
  logger.error(`Erreur ${statusCode}: ${message}`, err, {
    method: req.method,
    path: req.originalUrl,
    statusCode: statusCode,
    errorCode: errorCode
  });

  // Envoyer une réponse au client
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message
    }
  });
};

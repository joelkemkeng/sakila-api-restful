import { ErrorCode } from "./ErrorCode";

/**
 * Classe représentant une erreur d'API
 */
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public type: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

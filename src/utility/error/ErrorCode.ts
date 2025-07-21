// Les numéros de d'erreur standard de HTTP
export enum ErrorCode {
    BadRequest = 400,
    Unauthorized = 401,    
    Forbidden = 403,
    NotFound = 404,
    Conflict = 409,
    TooManyRequests = 429,
    InternalError = 500
}
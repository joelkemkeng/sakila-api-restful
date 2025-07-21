import { ApiError } from '@error/ApiError';
import { ErrorCode } from '@error/ErrorCode';
import { Request } from 'express';
import { JWT } from 'utility/JWT/JWT';
import { JWT_ACCESS_AUD, JWT_ISSUER } from 'utility/JWT/JWTConstants';
import { IAccessToken } from './IAccessToken';
import { IUserPayload } from '../../model/types/IUser';
import { UserRole } from '../../model/types/IUserRole';

// Liste des routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = [
  '/api-docs',
  '/health',
  '/graphql',
  '/api/films',
  '/api/films/category',
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout'
];

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<IUserPayload> {

  // Vérifier si la route actuelle est publique
  const currentPath = request.path;
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    currentPath === route || currentPath.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    // Route publique, on passe l'authentification
    return {
      user_id: 0,
      email: 'anonymous@example.com',
      username: 'anonymous',
      role: 'user' as UserRole
    };
  }

  if (securityName === 'jwt') {
    const authheader = request.headers.authorization || '';
    if (!authheader.startsWith('Bearer ')) {
      throw new ApiError(ErrorCode.Unauthorized, 'auth/missing-header', 'Missing authorization header with Bearer token');
    }

    const token = authheader.split('Bearer ')[1];

    const jwt = new JWT();
    let decoded = await jwt.decodeAndVerify<IAccessToken>(token, {
      issuer: JWT_ISSUER,
      audience: JWT_ACCESS_AUD,
    });
    
    // Convertir IAccessToken en IUserPayload
    const userPayload: IUserPayload = {
      user_id: decoded.user_id,
      email: decoded.email,
      username: decoded.username || '',
      role: decoded.role as UserRole // Assurons-nous que le rôle est conforme
    };
    
    // Ajouter l'utilisateur décodé à la requête pour un accès facile dans les contrôleurs
    request.user = userPayload;
    
    // Vérifier les scopes/permissions requis
    if (scopes && scopes.length > 0) {
      // Vérifier si l'utilisateur a le rôle d'administrateur (qui a accès à tout)
      if (decoded.role === 'admin') {
        return userPayload;
      }
      
      // Vérifier si l'utilisateur a au moins l'un des rôles/scopes requis
      const hasScope = scopes.some(scope => {
        // Si c'est un rôle valide et l'utilisateur a ce rôle
        if (scope === 'user' && decoded.role === 'user') {
          return true;
        }
        
        // Pour toute autre permission spécifique
        return false;
      });
      
      if (!hasScope) {
        throw new ApiError(
          ErrorCode.Forbidden,
          'auth/insufficient-permissions',
          `User does not have required permissions: ${scopes.join(', ')}`
        );
      }
    }
    
    return userPayload;
  }

  throw new ApiError(ErrorCode.Unauthorized, 'auth/invalid-security', 'Invalid security scheme');
}
import { Request, Response, NextFunction, RequestHandler } from "express";
import { IUserPayload } from "../model/types/IUser";
import { UserRole } from "../model/types/IUserRole";
import { JWT } from "../utility/JWT/JWT";

// Extend Express Request type
declare module "express-serve-static-core" {
  interface Request {
    user?: IUserPayload;
  }
}

export enum Permission {
  READ_USERS = 'read:users',
  CREATE_USER = 'create:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',

  READ_FILMS = 'read:films',
  CREATE_FILM = 'create:film',
  UPDATE_FILM = 'update:film',
  DELETE_FILM = 'delete:film',

  READ_ACTORS = 'read:actors',
  CREATE_ACTOR = 'create:actor',
  UPDATE_ACTOR = 'update:actor',
  DELETE_ACTOR = 'delete:actor',
}

export const authenticateJWT: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers?.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtInstance = new JWT();
    const decoded = await jwtInstance.decodeAndVerify<IUserPayload>(token, {
      issuer: process.env.JWT_ISSUER || 'api-video-rental',
      audience: process.env.JWT_AUDIENCE || 'api-clients',
    });

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ JWT Verification failed:", error);
    res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};

export function authorizeRole(roles: UserRole | UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: Authentication required" });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden: Insufficient permissions",
        required: allowedRoles,
        current: req.user.role
      });
      return;
    }

    next();
  };
}

export function authorizePermission(permissions: Permission | Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: Authentication required" });
      return;
    }

    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const userPermissions = getUserPermissions(req.user.role);

    const hasAllRequiredPermissions = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );

    if (!hasAllRequiredPermissions) {
      res.status(403).json({
        error: "Forbidden: Insufficient permissions",
        required: requiredPermissions,
        user: req.user.username,
        role: req.user.role
      });
      return;
    }

    next();
  };
}

// Key correction: Use string literals instead of enum values
function getUserPermissions(role: UserRole): Permission[] {
  switch (role) {
    case "admin":  // String literal for admin role
      return Object.values(Permission);
    case "user":   // String literal for user role
      return [
        Permission.READ_FILMS,
        Permission.READ_ACTORS,
      ];
    default:
      return [];
  }
}

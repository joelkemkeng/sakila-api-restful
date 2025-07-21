import { Request, Response, NextFunction } from "express";

/**
 * Middleware to enforce admin role for sensitive operations.
 */
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden: Admin role required" });
    return;
  }
  next();
};


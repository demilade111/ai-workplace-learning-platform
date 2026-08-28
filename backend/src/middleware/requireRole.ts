import type { Request, Response, NextFunction } from "express";
import { Errors } from "../lib/errors.js";

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.user!.role)) {
      throw Errors.forbidden(`Requires one of these roles: ${allowedRoles.join(", ")}`);
    }
    next();
  };
}

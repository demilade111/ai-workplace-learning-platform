import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { isTokenRevoked } from "../lib/token-revocation.js";
import { Errors } from "../lib/errors.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;

  if (!token) {
    throw Errors.missingToken();
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw Errors.invalidToken();
  }

  if (await isTokenRevoked(decoded.jti)) {
    throw Errors.tokenRevoked();
  }

  req.user = {
    userId: decoded.userId,
    organizationId: decoded.organizationId,
    role: decoded.role,
  };
  next();
}

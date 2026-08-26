import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { isTokenRevoked } from "../lib/token-revocation.js";
import { MissingTokenError, InvalidTokenError, TokenRevokedError } from "../lib/errors.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;

  if (!token) {
    throw new MissingTokenError();
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new InvalidTokenError();
  }

  if (await isTokenRevoked(decoded.jti)) {
    throw new TokenRevokedError();
  }

  req.user = {
    userId: decoded.userId,
    organizationId: decoded.organizationId,
    role: decoded.role,
  };
  next();
}

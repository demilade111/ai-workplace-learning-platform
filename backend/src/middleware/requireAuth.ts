import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { isTokenRevoked } from "../lib/token-revocation.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;

  if (!token) {
    res.status(401).json({ error: "Missing access token" });
    return;
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    res.status(401).json({ error: "Invalid or expired access token" });
    return;
  }

  if (await isTokenRevoked(decoded.jti)) {
    res.status(401).json({ error: "Token has been revoked" });
    return;
  }

  req.user = {
    userId: decoded.userId,
    organizationId: decoded.organizationId,
    role: decoded.role,
  };
  next();
}

import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

export type AccessTokenPayload = {
  userId: string;
  organizationId: string;
  role: string;
};

export type VerifiedAccessToken = AccessTokenPayload & {
  jti: string;
  iat: number;
  exp: number;
};

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "1h", jwtid: randomUUID() });
}

export function verifyAccessToken(token: string): VerifiedAccessToken {
  return jwt.verify(token, getSecret()) as VerifiedAccessToken;
}

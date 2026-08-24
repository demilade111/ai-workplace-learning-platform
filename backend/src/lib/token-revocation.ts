import { redis } from "./redis.js";

function revokedKey(jti: string): string {
  return `revoked:${jti}`;
}

export async function revokeToken(jti: string, expiresAt: number): Promise<void> {
  const secondsRemaining = expiresAt - Math.floor(Date.now() / 1000);
  if (secondsRemaining <= 0) {
    return;
  }
  await redis.set(revokedKey(jti), "1", "EX", secondsRemaining);
}

export async function isTokenRevoked(jti: string): Promise<boolean> {
  const value = await redis.get(revokedKey(jti));
  return value !== null;
}

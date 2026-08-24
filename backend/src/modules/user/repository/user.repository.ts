import { prisma } from "../../../db/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import type { User } from "../types/user.types.js";

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  data: { email: string; passwordHash: string },
  tx: Prisma.TransactionClient,
): Promise<User> {
  return tx.user.create({ data });
}

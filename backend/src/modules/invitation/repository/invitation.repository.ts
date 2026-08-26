import { prisma } from "../../../db/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import type { MembershipRole } from "../../organization/types/organization.types.js";
import type { Invitation } from "../types/invitation.types.js";

export async function createInvitation(data: {
  email: string;
  organizationId: string;
  role: MembershipRole;
  invitedById: string;
  token: string;
  expiresAt: Date;
}): Promise<Invitation> {
  return prisma.invitation.create({ data });
}

export async function findInvitationByToken(token: string): Promise<Invitation | null> {
  return prisma.invitation.findUnique({ where: { token } });
}

export async function markInvitationAccepted(
  id: string,
  tx: Prisma.TransactionClient,
): Promise<void> {
  await tx.invitation.update({ where: { id }, data: { acceptedAt: new Date() } });
}

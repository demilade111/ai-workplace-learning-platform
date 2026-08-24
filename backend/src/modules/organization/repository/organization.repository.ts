import type { Prisma } from "../../../generated/prisma/client.js";
import type { MembershipRole, Organization, OrganizationMembership } from "../types/organization.types.js";

export async function createOrganization(
  data: { name: string },
  tx: Prisma.TransactionClient,
): Promise<Organization> {
  return tx.organization.create({ data });
}

export async function createMembership(
  data: { userId: string; organizationId: string; role: MembershipRole },
  tx: Prisma.TransactionClient,
): Promise<OrganizationMembership> {
  return tx.organizationMembership.create({ data });
}

import type { MembershipRole } from "../../organization/types/organization.types.js";

export type Invitation = {
  id: string;
  email: string;
  organizationId: string;
  role: MembershipRole;
  invitedById: string;
  token: string;
  acceptedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
};

import { z } from "zod";
import type { MembershipRole, Organization } from "../../organization/types/organization.types.js";
import type { UserResponseDto } from "../../user/dto/user.dto.js";

export const createInvitationRequestSchema = z.object({
  email: z.string().email(),
  role: z.enum(["MANAGER", "EMPLOYEE"]),
});

export type CreateInvitationRequestDto = z.infer<typeof createInvitationRequestSchema>;

export type CreateInvitationResponseDto = {
  id: string;
  email: string;
  role: MembershipRole;
  expiresAt: Date;
  // TEMPORARY: no email service exists yet, so the raw token is returned here
  // for testing. This must be removed once invites are actually delivered by
  // email - the token should only ever reach the invitee through that link.
  token: string;
};

export const acceptInvitationRequestSchema = z.object({
  password: z.string().min(8),
});

export type AcceptInvitationRequestDto = z.infer<typeof acceptInvitationRequestSchema>;

export type AcceptInvitationResponseDto = {
  user: UserResponseDto;
  organization: Pick<Organization, "id" | "name">;
  role: MembershipRole;
  accessToken: string;
};

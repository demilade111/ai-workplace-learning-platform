import { z } from "zod";
import type { UserResponseDto } from "../../user/dto/user.dto.js";
import type { MembershipRole, Organization } from "../../organization/types/organization.types.js";

export const registerRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(1),
});

export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;

export type RegisterResponseDto = {
  user: UserResponseDto;
  organization: Pick<Organization, "id" | "name">;
};

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequestDto = z.infer<typeof loginRequestSchema>;

export type LoginResponseDto = {
  user: UserResponseDto;
  organization: Pick<Organization, "id" | "name">;
  role: MembershipRole;
  accessToken: string;
};

export type MeResponseDto = {
  user: UserResponseDto;
  organization: Pick<Organization, "id" | "name">;
  role: MembershipRole;
};

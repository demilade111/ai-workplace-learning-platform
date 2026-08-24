import { z } from "zod";
import type { UserResponseDto } from "../../user/dto/user.dto.js";
import type { Organization } from "../../organization/types/organization.types.js";

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

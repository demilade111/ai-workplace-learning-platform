import bcrypt from "bcryptjs";
import { prisma } from "../../../db/prisma.js";
import { findUserByEmail, createUser } from "../../user/repository/user.repository.js";
import { toUserResponseDto } from "../../user/dto/user.dto.js";
import { createOrganization, createMembership } from "../../organization/repository/organization.repository.js";
import type { RegisterRequestDto, RegisterResponseDto } from "../dto/auth.dto.js";

export class EmailAlreadyRegisteredError extends Error {
  constructor(public readonly email: string) {
    super(`Email already registered: ${email}`);
  }
}

export async function register(data: RegisterRequestDto): Promise<RegisterResponseDto> {
  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw new EmailAlreadyRegisteredError(data.email);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const { user, organization } = await prisma.$transaction(async (tx) => {
    const organization = await createOrganization({ name: data.organizationName }, tx);
    const user = await createUser({ email: data.email, passwordHash }, tx);
    await createMembership({ userId: user.id, organizationId: organization.id, role: "ADMIN" }, tx);

    return { user, organization };
  });

  return {
    user: toUserResponseDto(user),
    organization: { id: organization.id, name: organization.name },
  };
}

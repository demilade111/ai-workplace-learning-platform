import bcrypt from "bcryptjs";
import { prisma } from "../../../db/prisma.js";
import { signAccessToken, verifyAccessToken } from "../../../lib/jwt.js";
import { revokeToken } from "../../../lib/token-revocation.js";
import { Errors } from "../../../lib/errors.js";
import { findUserByEmail, findUserById, createUser } from "../../user/repository/user.repository.js";
import { toUserResponseDto } from "../../user/dto/user.dto.js";
import {
  createOrganization,
  createMembership,
  findMembershipByUserId,
} from "../../organization/repository/organization.repository.js";
import type {
  RegisterRequestDto,
  RegisterResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  MeResponseDto,
} from "../dto/auth.dto.js";

export async function register(data: RegisterRequestDto): Promise<RegisterResponseDto> {
  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw Errors.emailAlreadyRegistered(data.email);
  }

  const passwordHash: string = await bcrypt.hash(data.password, 10);

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

export async function login(data: LoginRequestDto): Promise<LoginResponseDto> {
  const user = await findUserByEmail(data.email);
  if (!user) {
    throw Errors.invalidCredentials();
  }

  const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);
  if (!passwordMatches) {
    throw Errors.invalidCredentials();
  }

  const membership = await findMembershipByUserId(user.id);
  if (!membership) {
    throw Errors.invalidCredentials();
  }

  const accessToken = signAccessToken({
    userId: user.id,
    organizationId: membership.organizationId,
    role: membership.role,
  });

  return {
    user: toUserResponseDto(user),
    organization: { id: membership.organization.id, name: membership.organization.name },
    role: membership.role,
    accessToken,
  };
}

export async function logout(accessToken: string): Promise<void> {
  let decoded;
  try {
    decoded = verifyAccessToken(accessToken);
  } catch {
    throw Errors.invalidToken();
  }
  await revokeToken(decoded.jti, decoded.exp);
}

export async function getMe(userId: string): Promise<MeResponseDto> {
  const user = await findUserById(userId);
  if (!user) {
    throw Errors.userNotFound();
  }

  const membership = await findMembershipByUserId(user.id);
  if (!membership) {
    throw Errors.userNotFound();
  }

  return {
    user: toUserResponseDto(user),
    organization: { id: membership.organization.id, name: membership.organization.name },
    role: membership.role,
  };
}

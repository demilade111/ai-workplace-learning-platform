import bcrypt from "bcryptjs";
import { prisma } from "../../../db/prisma.js";
import { signAccessToken, verifyAccessToken } from "../../../lib/jwt.js";
import { revokeToken } from "../../../lib/token-revocation.js";
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

export class EmailAlreadyRegisteredError extends Error {
  constructor(public readonly email: string) {
    super(`Email already registered: ${email}`);
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
  }
}

export async function register(data: RegisterRequestDto): Promise<RegisterResponseDto> {
  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw new EmailAlreadyRegisteredError(data.email);
  }

  const passwordHash:string = await bcrypt.hash(data.password, 10);

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
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);
  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  const membership = await findMembershipByUserId(user.id);
  if (!membership) {
    throw new InvalidCredentialsError();
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
  const decoded = verifyAccessToken(accessToken);
  await revokeToken(decoded.jti, decoded.exp);
}

export async function getMe(userId: string): Promise<MeResponseDto> {
  const user = await findUserById(userId);
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const membership = await findMembershipByUserId(user.id);
  if (!membership) {
    throw new InvalidCredentialsError();
  }

  return {
    user: toUserResponseDto(user),
    organization: { id: membership.organization.id, name: membership.organization.name },
    role: membership.role,
  };
}

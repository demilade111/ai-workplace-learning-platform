import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../../db/prisma.js";
import { signAccessToken } from "../../../lib/jwt.js";
import {
  createInvitation,
  findInvitationByToken,
  markInvitationAccepted,
} from "../repository/invitation.repository.js";
import { findUserByEmail, createUser } from "../../user/repository/user.repository.js";
import { toUserResponseDto } from "../../user/dto/user.dto.js";
import { createMembership } from "../../organization/repository/organization.repository.js";
import { AppError } from "../../../lib/errors.js";
import type {
  CreateInvitationRequestDto,
  CreateInvitationResponseDto,
  AcceptInvitationResponseDto,
} from "../dto/invitation.dto.js";

const INVITATION_EXPIRY_DAYS = 7;

export class InvitationNotFoundError extends AppError {
  constructor() {
    super("Invitation not found", 404);
  }
}

export class InvitationAlreadyAcceptedError extends AppError {
  constructor() {
    super("This invitation has already been accepted", 409);
  }
}

export class InvitationExpiredError extends AppError {
  constructor() {
    super("This invitation has expired", 409);
  }
}

export class EmailAlreadyHasAccountError extends AppError {
  constructor(public readonly email: string) {
    super(`An account already exists for ${email}`, 409);
  }
}

export async function createInvitationForOrg(
  organizationId: string,
  invitedById: string,
  data: CreateInvitationRequestDto,
): Promise<CreateInvitationResponseDto> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const invitation = await createInvitation({
    email: data.email,
    organizationId,
    role: data.role,
    invitedById,
    token,
    expiresAt,
  });

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    token: invitation.token,
  };
}

export async function acceptInvitation(
  token: string,
  password: string,
): Promise<AcceptInvitationResponseDto> {
  const invitation = await findInvitationByToken(token);
  if (!invitation) {
    throw new InvitationNotFoundError();
  }

  if (invitation.acceptedAt) {
    throw new InvitationAlreadyAcceptedError();
  }

  if (invitation.expiresAt < new Date()) {
    throw new InvitationExpiredError();
  }

  const existing = await findUserByEmail(invitation.email);
  if (existing) {
    throw new EmailAlreadyHasAccountError(invitation.email);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const user = await createUser({ email: invitation.email, passwordHash }, tx);
    await createMembership(
      { userId: user.id, organizationId: invitation.organizationId, role: invitation.role },
      tx,
    );
    await markInvitationAccepted(invitation.id, tx);

    return user;
  });

  const accessToken = signAccessToken({
    userId: user.id,
    organizationId: invitation.organizationId,
    role: invitation.role,
  });

  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: invitation.organizationId },
  });

  return {
    user: toUserResponseDto(user),
    organization: { id: organization.id, name: organization.name },
    role: invitation.role,
    accessToken,
  };
}

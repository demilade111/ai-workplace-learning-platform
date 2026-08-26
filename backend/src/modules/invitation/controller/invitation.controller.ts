import type { Request, Response } from "express";
import { createInvitationRequestSchema, acceptInvitationRequestSchema } from "../dto/invitation.dto.js";
import {
  createInvitationForOrg,
  acceptInvitation,
  InvitationNotFoundError,
  InvitationAlreadyAcceptedError,
  InvitationExpiredError,
  EmailAlreadyHasAccountError,
} from "../service/invitation.service.js";

export async function createInvitationController(req: Request, res: Response) {
  // TEMPORARY: inline role check. RBAC-002 will replace this with reusable
  // authorization middleware once real role/permission policies exist.
  if (req.user!.role !== "ADMIN") {
    res.status(403).json({ error: "Only an organization admin can invite members" });
    return;
  }

  const parsed = createInvitationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const result = await createInvitationForOrg(req.user!.organizationId, req.user!.userId, parsed.data);
  req.log.info(
    { organizationId: req.user!.organizationId, invitedEmail: result.email, role: result.role },
    "invitation_created",
  );
  res.status(201).json(result);
}

export async function acceptInvitationController(req: Request, res: Response) {
  const parsed = acceptInvitationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const token = req.params.token;
  if (typeof token !== "string") {
    res.status(400).json({ error: "Invalid invitation link" });
    return;
  }

  try {
    const result = await acceptInvitation(token, parsed.data.password);
    req.log.info(
      { userId: result.user.id, organizationId: result.organization.id },
      "invitation_accepted",
    );
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof InvitationNotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof InvitationAlreadyAcceptedError || err instanceof InvitationExpiredError) {
      res.status(409).json({ error: err.message });
      return;
    }
    if (err instanceof EmailAlreadyHasAccountError) {
      res.status(409).json({ error: err.message });
      return;
    }
    throw err;
  }
}

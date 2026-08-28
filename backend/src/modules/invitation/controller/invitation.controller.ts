import type { Request, Response } from "express";
import { createInvitationRequestSchema, acceptInvitationRequestSchema } from "../dto/invitation.dto.js";
import { createInvitationForOrg, acceptInvitation } from "../service/invitation.service.js";

export async function createInvitationController(req: Request, res: Response) {
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

  const result = await acceptInvitation(token, parsed.data.password);
  req.log.info(
    { userId: result.user.id, organizationId: result.organization.id },
    "invitation_accepted",
  );
  res.status(201).json(result);
}

import { Router } from "express";
import { createInvitationController, acceptInvitationController } from "../controller/invitation.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.js";
import { requireRole } from "../../../middleware/requireRole.js";

export const invitationRouter = Router();

invitationRouter.post("/", requireAuth, requireRole("ADMIN"), createInvitationController);
invitationRouter.post("/accept/:token", acceptInvitationController);

import { Router } from "express";
import { createInvitationController, acceptInvitationController } from "../controller/invitation.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.js";

export const invitationRouter = Router();

invitationRouter.post("/", requireAuth, createInvitationController);
invitationRouter.post("/accept/:token", acceptInvitationController);

import type { Request, Response } from "express";
import { registerRequestSchema, loginRequestSchema } from "../dto/auth.dto.js";
import { register, login, logout, getMe } from "../service/auth.service.js";
import { Errors } from "../../../lib/errors.js";

export async function registerController(req: Request, res: Response) {
  const parsed = registerRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const result = await register(parsed.data);
  req.log.info({ userId: result.user.id, organizationId: result.organization.id }, "user_registered");
  res.status(201).json(result);
}

export async function loginController(req: Request, res: Response) {
  const parsed = loginRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const result = await login(parsed.data);
  req.log.info({ userId: result.user.id, organizationId: result.organization.id }, "user_logged_in");
  res.status(200).json(result);
}

export async function logoutController(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;

  if (!token) {
    throw Errors.missingToken();
  }

  await logout(token);
  req.log.info({}, "user_logged_out");
  res.status(204).send();
}

export async function meController(req: Request, res: Response) {
  const result = await getMe(req.user!.userId);
  res.status(200).json(result);
}

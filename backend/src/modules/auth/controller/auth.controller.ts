import type { Request, Response } from "express";
import { registerRequestSchema, loginRequestSchema } from "../dto/auth.dto.js";
import {
  register,
  login,
  logout,
  getMe,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
} from "../service/auth.service.js";

export async function registerController(req: Request, res: Response) {
  const parsed = registerRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  try {
    const result = await register(parsed.data);
    req.log.info({ userId: result.user.id, organizationId: result.organization.id }, "user_registered");
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof EmailAlreadyRegisteredError) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    throw err;
  }
}

export async function loginController(req: Request, res: Response) {
  const parsed = loginRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  try {
    const result = await login(parsed.data);
    req.log.info({ userId: result.user.id, organizationId: result.organization.id }, "user_logged_in");
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    throw err;
  }
}

export async function logoutController(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;

  if (!token) {
    res.status(401).json({ error: "Missing access token" });
    return;
  }

  try {
    await logout(token);
    req.log.info({}, "user_logged_out");
    res.status(204).send();
  } catch {
    res.status(401).json({ error: "Invalid access token" });
  }
}

export async function meController(req: Request, res: Response) {
  try {
    const result = await getMe(req.user!.userId);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      res.status(401).json({ error: "User no longer exists" });
      return;
    }
    throw err;
  }
}

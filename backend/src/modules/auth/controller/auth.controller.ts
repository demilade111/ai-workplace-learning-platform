import type { Request, Response } from "express";
import { registerRequestSchema } from "../dto/auth.dto.js";
import { register, EmailAlreadyRegisteredError } from "../service/auth.service.js";

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

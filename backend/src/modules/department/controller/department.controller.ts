import type { Request, Response } from "express";
import { createDepartmentRequestSchema, addMemberRequestSchema } from "../dto/department.dto.js";
import { createDepartmentForOrg, addMemberToDepartment } from "../service/department.service.js";
import { Errors } from "../../../lib/errors.js";

export async function createDepartmentController(req: Request, res: Response) {
  const parsed = createDepartmentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const result = await createDepartmentForOrg(req.user!.organizationId, parsed.data);
  req.log.info(
    { departmentId: result.id, organizationId: req.user!.organizationId },
    "department_created",
  );
  res.status(201).json(result);
}

export async function addMemberController(req: Request, res: Response) {
  const parsed = addMemberRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const departmentId = req.params.id;
  if (typeof departmentId !== "string") {
    throw Errors.notFound("Invalid department id");
  }

  const result = await addMemberToDepartment(departmentId, req.user!.organizationId, parsed.data);
  req.log.info(
    { departmentId: result.departmentId, userId: result.userId },
    "department_member_added",
  );
  res.status(201).json(result);
}

import { Router } from "express";
import { createDepartmentController, addMemberController } from "../controller/department.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.js";
import { requireRole } from "../../../middleware/requireRole.js";

export const departmentRouter = Router();

departmentRouter.use(requireAuth);
departmentRouter.post("/", requireRole("ADMIN", "MANAGER"), createDepartmentController);
departmentRouter.post("/:id/members", requireRole("ADMIN", "MANAGER"), addMemberController);

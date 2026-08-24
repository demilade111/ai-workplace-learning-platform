import { Router } from "express";
import { registerController, loginController, logoutController, meController } from "../controller/auth.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.js";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/me", requireAuth, meController);

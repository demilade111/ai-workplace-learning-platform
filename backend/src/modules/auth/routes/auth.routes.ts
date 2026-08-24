import { Router } from "express";
import { registerController, loginController, logoutController } from "../controller/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);

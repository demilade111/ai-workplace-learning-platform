import { Router } from "express";
import { registerController } from "../controller/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", registerController);

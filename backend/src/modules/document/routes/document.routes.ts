import { Router } from "express";
import {
  presignController,
  confirmDocumentController,
  listDocumentsController,
  getDocumentController,
} from "../controller/document.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.js";

export const documentRouter = Router();

documentRouter.use(requireAuth);
documentRouter.post("/presign", presignController);
documentRouter.post("/", confirmDocumentController);
documentRouter.get("/", listDocumentsController);
documentRouter.get("/:id", getDocumentController);

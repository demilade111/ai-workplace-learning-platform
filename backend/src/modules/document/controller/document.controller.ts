import type { Request, Response } from "express";
import { presignRequestSchema, confirmDocumentRequestSchema } from "../dto/document.dto.js";
import {
  createPresignedUpload,
  confirmDocument,
  listDocumentsForOrg,
  getDocumentForOrg,
} from "../service/document.service.js";
import { Errors } from "../../../lib/errors.js";

export async function presignController(req: Request, res: Response) {
  const parsed = presignRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const result = await createPresignedUpload(req.user!.organizationId, parsed.data);
  res.status(200).json(result);
}

export async function confirmDocumentController(req: Request, res: Response) {
  const parsed = confirmDocumentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const result = await confirmDocument(req.user!.organizationId, req.user!.userId, parsed.data);
  req.log.info(
    { documentId: result.id, organizationId: req.user!.organizationId },
    "document_uploaded",
  );
  res.status(201).json(result);
}

export async function listDocumentsController(req: Request, res: Response) {
  const result = await listDocumentsForOrg(req.user!.organizationId);
  res.status(200).json(result);
}

export async function getDocumentController(req: Request, res: Response) {
  const documentId = req.params.id;
  if (typeof documentId !== "string") {
    throw Errors.notFound("Document not found");
  }

  const result = await getDocumentForOrg(req.user!.organizationId, documentId);
  res.status(200).json(result);
}

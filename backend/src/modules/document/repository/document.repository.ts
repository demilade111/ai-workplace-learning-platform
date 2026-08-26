import { prisma } from "../../../db/prisma.js";
import type { Document } from "../types/document.types.js";

export async function createDocument(data: {
  organizationId: string;
  uploadedById: string;
  filename: string;
  storageKey: string;
  mimeType: string;
  size: number;
}): Promise<Document> {
  return prisma.document.create({ data });
}

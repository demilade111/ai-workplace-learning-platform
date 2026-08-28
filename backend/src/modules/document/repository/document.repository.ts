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

export async function findDocumentsByOrganization(organizationId: string): Promise<Document[]> {
  return prisma.document.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findDocumentById(id: string): Promise<Document | null> {
  return prisma.document.findUnique({ where: { id } });
}

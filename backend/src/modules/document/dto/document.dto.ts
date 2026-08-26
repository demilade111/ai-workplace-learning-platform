import { z } from "zod";
import type { Document } from "../types/document.types.js";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export const presignRequestSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  size: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
});

export type PresignRequestDto = z.infer<typeof presignRequestSchema>;

export type PresignResponseDto = {
  uploadUrl: string;
  storageKey: string;
};

export const confirmDocumentRequestSchema = z.object({
  storageKey: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  size: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
});

export type ConfirmDocumentRequestDto = z.infer<typeof confirmDocumentRequestSchema>;

export type DocumentResponseDto = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  status: string;
  createdAt: Date;
};

export function toDocumentResponseDto(document: Document): DocumentResponseDto {
  return {
    id: document.id,
    filename: document.filename,
    mimeType: document.mimeType,
    size: document.size,
    status: document.status,
    createdAt: document.createdAt,
  };
}

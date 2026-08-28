import { randomUUID } from "node:crypto";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, S3_BUCKET } from "../../../lib/s3.js";
import { Errors } from "../../../lib/errors.js";
import { createDocument, findDocumentsByOrganization, findDocumentById } from "../repository/document.repository.js";
import { toDocumentResponseDto } from "../dto/document.dto.js";
import type {
  PresignRequestDto,
  PresignResponseDto,
  ConfirmDocumentRequestDto,
  DocumentResponseDto,
} from "../dto/document.dto.js";

const PRESIGN_EXPIRY_SECONDS = 5 * 60;

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function createPresignedUpload(
  organizationId: string,
  data: PresignRequestDto,
): Promise<PresignResponseDto> {
  const storageKey = `${organizationId}/${randomUUID()}-${sanitizeFilename(data.filename)}`;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: storageKey,
      ContentType: data.mimeType,
    }),
    { expiresIn: PRESIGN_EXPIRY_SECONDS },
  );

  return { uploadUrl, storageKey };
}

export async function confirmDocument(
  organizationId: string,
  uploadedById: string,
  data: ConfirmDocumentRequestDto,
): Promise<DocumentResponseDto> {
  if (!data.storageKey.startsWith(`${organizationId}/`)) {
    throw Errors.forbidden("Storage key does not belong to your organization");
  }

  try {
    await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: data.storageKey }));
  } catch {
    throw Errors.notFound("No uploaded file found at this storage key");
  }

  const document = await createDocument({
    organizationId,
    uploadedById,
    filename: data.filename,
    storageKey: data.storageKey,
    mimeType: data.mimeType,
    size: data.size,
  });

  return toDocumentResponseDto(document);
}

export async function listDocumentsForOrg(organizationId: string): Promise<DocumentResponseDto[]> {
  const documents = await findDocumentsByOrganization(organizationId);
  return documents.map(toDocumentResponseDto);
}

export async function getDocumentForOrg(
  organizationId: string,
  documentId: string,
): Promise<DocumentResponseDto> {
  const document = await findDocumentById(documentId);
  if (!document || document.organizationId !== organizationId) {
    throw Errors.notFound("Document not found");
  }
  return toDocumentResponseDto(document);
}

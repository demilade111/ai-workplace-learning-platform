export type DocumentStatus = "UPLOADED" | "QUEUED" | "PROCESSING" | "READY" | "FAILED";

export type Document = {
  id: string;
  organizationId: string;
  uploadedById: string;
  filename: string;
  storageKey: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  createdAt: Date;
};

import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../../db/prisma.js";
import { getDocumentForOrg, listDocumentsForOrg } from "./document.service.js";

async function createTestOrgWithDocument() {
  const organization = await prisma.organization.create({
    data: { name: `Org-${randomUUID()}` },
  });

  const user = await prisma.user.create({
    data: {
      email: `${randomUUID()}@example.com`,
      passwordHash: "not-a-real-hash",
    },
  });

  await prisma.organizationMembership.create({
    data: { userId: user.id, organizationId: organization.id, role: "ADMIN" },
  });

  const document = await prisma.document.create({
    data: {
      organizationId: organization.id,
      uploadedById: user.id,
      filename: "policy.pdf",
      storageKey: `${organization.id}/${randomUUID()}-policy.pdf`,
      mimeType: "application/pdf",
      size: 100,
    },
  });

  return { organization, user, document };
}

async function cleanup() {
  await prisma.document.deleteMany();
  await prisma.organizationMembership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

describe("document tenant isolation", () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it("does not allow one organization to fetch another organization's document", async () => {
    const orgA = await createTestOrgWithDocument();
    const orgB = await createTestOrgWithDocument();

    await expect(getDocumentForOrg(orgB.organization.id, orgA.document.id)).rejects.toThrow(
      "Document not found",
    );

    const ownDocument = await getDocumentForOrg(orgA.organization.id, orgA.document.id);
    expect(ownDocument.id).toBe(orgA.document.id);
  });

  it("does not include another organization's documents in the list", async () => {
    const orgA = await createTestOrgWithDocument();
    const orgB = await createTestOrgWithDocument();

    const orgAList = await listDocumentsForOrg(orgA.organization.id);
    const orgBList = await listDocumentsForOrg(orgB.organization.id);

    expect(orgAList.map((d) => d.id)).toContain(orgA.document.id);
    expect(orgAList.map((d) => d.id)).not.toContain(orgB.document.id);
    expect(orgBList.map((d) => d.id)).not.toContain(orgA.document.id);
  });
});

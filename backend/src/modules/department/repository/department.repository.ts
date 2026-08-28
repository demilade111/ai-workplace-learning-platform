import { prisma } from "../../../db/prisma.js";
import type { Department, DepartmentMembership } from "../types/department.types.js";

export async function createDepartment(data: {
  name: string;
  organizationId: string;
}): Promise<Department> {
  return prisma.department.create({ data });
}

export async function findDepartmentById(id: string): Promise<Department | null> {
  return prisma.department.findUnique({ where: { id } });
}

export async function createDepartmentMembership(data: {
  userId: string;
  departmentId: string;
}): Promise<DepartmentMembership> {
  return prisma.departmentMembership.create({ data });
}

export async function findDepartmentMembership(
  userId: string,
  departmentId: string,
): Promise<DepartmentMembership | null> {
  return prisma.departmentMembership.findUnique({
    where: { userId_departmentId: { userId, departmentId } },
  });
}

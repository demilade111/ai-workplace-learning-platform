import {
  createDepartment,
  findDepartmentById,
  createDepartmentMembership,
  findDepartmentMembership,
} from "../repository/department.repository.js";
import { findMembership } from "../../organization/repository/organization.repository.js";
import { Errors } from "../../../lib/errors.js";
import { toDepartmentResponseDto } from "../dto/department.dto.js";
import type {
  CreateDepartmentRequestDto,
  DepartmentResponseDto,
  AddMemberRequestDto,
  AddMemberResponseDto,
} from "../dto/department.dto.js";

export async function createDepartmentForOrg(
  organizationId: string,
  data: CreateDepartmentRequestDto,
): Promise<DepartmentResponseDto> {
  const department = await createDepartment({ name: data.name, organizationId });
  return toDepartmentResponseDto(department);
}

export async function addMemberToDepartment(
  departmentId: string,
  requesterOrganizationId: string,
  data: AddMemberRequestDto,
): Promise<AddMemberResponseDto> {
  const department = await findDepartmentById(departmentId);
  if (!department) {
    throw Errors.notFound("Department not found");
  }

  if (department.organizationId !== requesterOrganizationId) {
    throw Errors.forbidden("Department does not belong to your organization");
  }

  const membership = await findMembership(data.userId, requesterOrganizationId);
  if (!membership) {
    throw Errors.notFound("User is not a member of this organization");
  }

  const existingDepartmentMembership = await findDepartmentMembership(data.userId, departmentId);
  if (existingDepartmentMembership) {
    throw Errors.conflict("User is already a member of this department");
  }

  await createDepartmentMembership({ userId: data.userId, departmentId });

  return { userId: data.userId, departmentId };
}

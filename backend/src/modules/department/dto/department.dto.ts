import { z } from "zod";
import type { Department } from "../types/department.types.js";

export const createDepartmentRequestSchema = z.object({
  name: z.string().min(1),
});

export type CreateDepartmentRequestDto = z.infer<typeof createDepartmentRequestSchema>;

export type DepartmentResponseDto = {
  id: string;
  name: string;
  createdAt: Date;
};

export function toDepartmentResponseDto(department: Department): DepartmentResponseDto {
  return {
    id: department.id,
    name: department.name,
    createdAt: department.createdAt,
  };
}

export const addMemberRequestSchema = z.object({
  userId: z.string().uuid(),
});

export type AddMemberRequestDto = z.infer<typeof addMemberRequestSchema>;

export type AddMemberResponseDto = {
  userId: string;
  departmentId: string;
};

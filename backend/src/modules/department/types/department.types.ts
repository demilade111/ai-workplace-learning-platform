export type Department = {
  id: string;
  name: string;
  organizationId: string;
  createdAt: Date;
};

export type DepartmentMembership = {
  id: string;
  userId: string;
  departmentId: string;
  createdAt: Date;
};

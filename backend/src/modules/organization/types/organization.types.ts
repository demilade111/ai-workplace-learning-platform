export type MembershipRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export type Organization = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrganizationMembership = {
  id: string;
  userId: string;
  organizationId: string;
  role: MembershipRole;
  createdAt: Date;
};

export type UserRole = "admin" | "hr" | "employee" | "manager";

export type UserStatus = "pending" | "active" | "suspended" | "disabled";

export interface LinkedEmployeeSummary {
  id: string;
  name: string;
  employeeNumber: string;
  employmentStatus: string;
}

export interface ManagedUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  linkedEmployee: LinkedEmployeeSummary | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreatedUser {
  user: Pick<
    ManagedUser,
    "id" | "email" | "role" | "status" | "isActive" | "createdAt"
  >;
  invitationSent: boolean;
}

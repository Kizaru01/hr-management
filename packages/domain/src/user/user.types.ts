export type UserId = string;

export type UserRole = "admin" | "hr" | "employee";

export interface User {
  id: UserId;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date | null;

  employeeId?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export const EMPLOYMENT_STATUSES = [
  "active",
  "inactive",
  "on_leave",
  "resigned",
  "terminated",
  "suspended",
] as const;

export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const EMPLOYMENT_TYPES = [
  "regular",
  "probationary",
  "contractual",
  "intern",
  "part_time",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const USER_ROLES = ["employee", "manager", "admin", "hr"] as const;

export const DEFAULT_DEPARTMENTS = [
  "Human Resources",
  "Information Technology",
  "Finance",
  "Accounting",
  "Operations",
] as const;

export type DefaultDepartment =
  (typeof DEFAULT_DEPARTMENTS)[number];
import type { Employee } from "./employee.types.js";

export function isEligibleForRegularization(
  employee: Employee,
): boolean {
  const today = new Date();

  const monthsWorked =
    (today.getFullYear() - employee.hireDate.getFullYear()) * 12 +
    (today.getMonth() - employee.hireDate.getMonth());

  return (
    employee.employmentStatus === "active" &&
    monthsWorked >= 6
  );
}

export function canTerminateEmployee(
  employee: Employee,
): boolean {
  return employee.employmentStatus !== "terminated";
}
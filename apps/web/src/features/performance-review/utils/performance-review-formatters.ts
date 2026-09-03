import type { PerformanceReviewRole } from "../types/performance-review";

const performanceReviewDateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Manila",
});

const performanceReviewRoleLabels: Record<PerformanceReviewRole, string> = {
  admin: "Admin",
  hr: "HR",
  employee: "Employee",
  manager: "Manager",
};

export const formatPerformanceReviewDate = (value: string) =>
  performanceReviewDateFormatter.format(new Date(value));

export const formatPerformanceReviewRole = (role: PerformanceReviewRole) =>
  performanceReviewRoleLabels[role];

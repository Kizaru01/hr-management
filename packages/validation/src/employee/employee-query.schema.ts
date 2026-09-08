import { EMPLOYMENT_STATUSES } from "@hr-management/constants";
import { z } from "zod";

export const employeeQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  departmentId: z.string().trim().min(1).max(100).optional(),
  positionId: z.string().trim().min(1).max(100).optional(),
  branchId: z.string().trim().min(1).max(100).optional(),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES).optional(),
});

export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;

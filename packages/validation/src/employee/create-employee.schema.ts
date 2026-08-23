import { EMPLOYMENT_TYPES } from "@hr-management/constants";
import { z } from "zod";

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),

  middleName: z.string().trim().optional(),

  lastName: z.string().trim().min(1, "Last name is required."),

  email: z.string().trim().email("Please enter a valid email address."),

  hireDate: z.iso.date("Hire date must use YYYY-MM-DD format."),

  departmentId: z.string().trim().min(1, "Department is required."),

  positionId: z.string().trim().min(1, "Position is required."),

  employmentType: z.enum(EMPLOYMENT_TYPES),

  branchId: z.string().trim().min(1, "Branch is required."),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

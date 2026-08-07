import { EMPLOYMENT_TYPES } from "@hr-management/constants";
import { z } from "zod";

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Please enter a valid email address."),
  hireDate: z.coerce.date(),
  departmentId: z.string().min(1, "Department is required."),
  positionId: z.string().min(1, "Position is required."),
  employmentType: z.enum(EMPLOYMENT_TYPES),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
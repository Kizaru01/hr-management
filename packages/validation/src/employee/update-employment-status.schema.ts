import { EMPLOYMENT_STATUSES } from "@hr-management/constants";
import { z } from "zod";

export const updateEmploymentStatusSchema = z.object({
  employmentStatus: z.enum(EMPLOYMENT_STATUSES),
});

export type UpdateEmploymentStatusInput = z.infer<
  typeof updateEmploymentStatusSchema
>;

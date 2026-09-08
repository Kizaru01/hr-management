import { z } from "zod";

export const departmentQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type DepartmentQueryInput = z.infer<typeof departmentQuerySchema>;

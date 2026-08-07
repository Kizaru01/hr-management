import { z } from "zod";

export const createDepartmentSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Department code is required.")
    .max(50, "Department code must not exceed 50 characters."),
  name: z
    .string()
    .trim()
    .min(2, "Department name must contain at least 2 characters.")
    .max(100, "Department name must not exceed 100 characters."),
  description: z.string().trim().max(500, "Department description must not exceed 500 characters.").nullable().optional(),
});

export type CreateDepartmentInput = z.infer<
  typeof createDepartmentSchema
>;
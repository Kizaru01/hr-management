import { z } from "zod";

export const createPositionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Position name must contain at least 2 characters.")
    .max(100, "Position name must not exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters.")
    .optional(),

  salary: z
    .number()
    .nonnegative("Salary must be zero or greater."),

  allowance: z
    .number()
    .nonnegative("Allowance must be zero or greater.")
    .default(0),

  departmentId: z
    .string()
    .trim()
    .min(1, "Department is required."),
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
import { z } from "zod";

export const createPositionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Position name must contain at least 2 characters.")
    .max(100, "Position name must not exceed 100 characters."),

  departmentId: z.string().trim().min(1, "Department is required."),
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
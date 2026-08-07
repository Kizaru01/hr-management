import { z } from "zod";

export const createBranchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Branch name must contain at least 2 characters.")
    .max(100, "Branch name must not exceed 100 characters."),

  address: z
    .string()
    .trim()
    .max(255, "Address must not exceed 255 characters.")
    .optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
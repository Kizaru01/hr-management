import { z } from "zod";

export const branchQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type BranchQueryInput = z.infer<typeof branchQuerySchema>;

import { z } from "zod";

export const createBranchSchema = z.object({
  code: z.string().trim().min(1, "Branch code is required."),
  name: z.string().trim().min(2, "Branch name is required."),
  address: z.string().trim().min(1, "Address is required."),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  allowedRadius: z.number().int().positive().optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;

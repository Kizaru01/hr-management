import { z } from "zod";

export const positionQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type PositionQueryInput = z.infer<typeof positionQuerySchema>;

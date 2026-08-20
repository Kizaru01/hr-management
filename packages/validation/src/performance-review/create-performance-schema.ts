import { z } from "zod";

export const createPerformanceReviewSchema = z.object({
  reviewDate: z.coerce.date(),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating must not exceed 5."),

  strengths: z.string().trim().max(2000).optional(),
  improvements: z.string().trim().max(2000).optional(),
  comments: z.string().trim().max(3000).optional(),
});

export type CreatePerformanceReviewInput = z.infer<
  typeof createPerformanceReviewSchema
>;

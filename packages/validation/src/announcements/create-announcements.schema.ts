import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must contain at least 3 characters.")
    .max(150, "Title must not exceed 150 characters."),
  content: z.string().trim().min(1, "Content is required."),
  expiresAt: z.iso
    .datetime({
      offset: true,
      error: "Expiration date must be a valid ISO 8601 datetime.",
    })
    .refine((expiresAt) => new Date(expiresAt).getTime() > Date.now(), {
      message: "Expiration date must be later than the current time.",
    })
    .optional(),
  audience: z.enum(["company", "department", "branch"]),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

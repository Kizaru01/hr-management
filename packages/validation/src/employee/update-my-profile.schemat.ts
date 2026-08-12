import { z } from "zod";

export const updateMyProfileSchema = z.object({
  middleName: z.string().trim().optional(),

  phoneNumber: z.string().trim().min(1, "Phone number is required.").optional(),

  avatar: z.string().trim().url("Avatar must be a valid URL.").optional(),
});

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;

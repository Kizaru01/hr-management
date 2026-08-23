import { z } from "zod";

export const updateMyProfileSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(7, "Phone number must contain at least 7 characters.")
    .max(20, "Phone number must not exceed 20 characters.")
    .optional(),
  birthDate: z.iso
    .date("Birth date must use YYYY-MM-DD format.")
    .refine(
      (birthDate) =>
        new Date(`${birthDate}T00:00:00.000Z`).getTime() <= Date.now(),
      "Birth date cannot be in the future.",
    )
    .optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z
    .string()
    .trim()
    .min(5, "Address must contain at least 5 characters.")
    .max(500, "Address must not exceed 500 characters.")
    .optional(),
  emergencyContactName: z
    .string()
    .trim()
    .min(2, "Emergency contact name must contain at least 2 characters.")
    .max(100, "Emergency contact name must not exceed 100 characters.")
    .optional(),
  emergencyContactPhone: z
    .string()
    .trim()
    .min(7, "Emergency contact phone must contain at least 7 characters.")
    .max(20, "Emergency contact phone must not exceed 20 characters.")
    .optional(),
});

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;

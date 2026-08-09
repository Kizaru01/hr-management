import { z } from "zod";

export const activateAccountSchema = z
  .object({
    token: z.string().trim().min(1, "Activation token is required."),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(72, "Password must not exceed 72 characters."),

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ActivateAccountInput = z.infer<typeof activateAccountSchema>;

import { USER_ROLES } from "@hr-management/constants";
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),

  role: z.enum(USER_ROLES),

  employeeNumber: z.string().trim().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

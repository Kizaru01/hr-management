import { USER_ROLES } from "@hr-management/constants";
import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(USER_ROLES),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

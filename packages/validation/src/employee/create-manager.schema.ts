import { z } from "zod";

export const assignManagerSchema = z.object({
  managerId: z.string().min(1, "Manager is required."),
});

export type AssignManagerInput = z.infer<typeof assignManagerSchema>;

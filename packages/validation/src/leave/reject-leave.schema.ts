import { z } from "zod";

export const rejectLeaveSchema = z.object({
  remarks: z
    .string()
    .trim()
    .min(1, "Rejection reason is required.")
    .max(500, "Remarks must not exceed 500 characters."),
});

export type RejectLeaveInput = z.infer<typeof rejectLeaveSchema>;
